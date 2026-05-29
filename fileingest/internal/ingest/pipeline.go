// Package ingest orchestrates the full RAG ingestion flow:
// download -> extract -> chunk -> embed -> persist.
package ingest

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/ingest/chunker"
	"github.com/elevenpray/fileingest/internal/ingest/extractor"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/storage/milvus"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
	s3client "github.com/elevenpray/fileingest/internal/storage/s3"
)

// embedBatchSize bounds how many chunks we embed per HTTP call to Azure. Most
// embedding models cap input array length around 96-2048; 64 is a conservative
// default that also keeps memory usage reasonable.
const embedBatchSize = 64

// Pipeline coordinates extractors, chunker, LLM and repositories.
type Pipeline struct {
	logger     *slog.Logger
	s3         *s3client.Client
	extractors *extractor.Registry
	chunker    *chunker.Recursive
	llm        *llm.Client
	docs       *postgres.DocumentRepo
	milvus     *milvus.Client
	maxFileMB  int
}

// New builds a Pipeline. All dependencies are mandatory.
func New(
	logger *slog.Logger,
	s3 *s3client.Client,
	chunker *chunker.Recursive,
	llm *llm.Client,
	docs *postgres.DocumentRepo,
	mv *milvus.Client,
	maxFileMB int,
) *Pipeline {
	return &Pipeline{
		logger:     logger,
		s3:         s3,
		extractors: extractor.NewRegistry(),
		chunker:    chunker,
		llm:        llm,
		docs:       docs,
		milvus:     mv,
		maxFileMB:  maxFileMB,
	}
}

// IngestRequest is what handlers pass into the pipeline.
type IngestRequest struct {
	DocumentID  uuid.UUID
	WorkspaceID uuid.UUID
	UserID      uuid.UUID
	S3Key       string
	Filename    string
	MimeType    string
}

// Run executes the full ingest synchronously. The status of the document is
// updated as the pipeline progresses, and any error is persisted as the
// document's `error` field.
func (p *Pipeline) Run(ctx context.Context, req IngestRequest) error {
	start := time.Now()
	log := p.logger.With(
		"document_id", req.DocumentID.String(),
		"workspace_id", req.WorkspaceID.String(),
		"s3_key", req.S3Key,
	)

	doc := &domain.Document{
		ID:          req.DocumentID,
		WorkspaceID: req.WorkspaceID,
		UserID:      req.UserID,
		SourceURI:   "s3://" + p.s3.Bucket() + "/" + req.S3Key,
		Filename:    req.Filename,
		MimeType:    req.MimeType,
		Status:      domain.StatusPending,
	}
	if err := p.docs.Create(ctx, doc); err != nil {
		return fmt.Errorf("create document row: %w", err)
	}

	if err := p.runStages(ctx, log, req); err != nil {
		msg := err.Error()
		_ = p.docs.UpdateStatus(ctx, req.DocumentID, domain.StatusFailed, nil, &msg)
		log.Error("ingest_failed", "err", err, "duration_ms", time.Since(start).Milliseconds())
		return err
	}
	log.Info("ingest_done", "duration_ms", time.Since(start).Milliseconds())
	return nil
}

func (p *Pipeline) runStages(ctx context.Context, log *slog.Logger, req IngestRequest) error {
	// 1. Extract
	if err := p.docs.UpdateStatus(ctx, req.DocumentID, domain.StatusExtracting, nil, nil); err != nil {
		return err
	}
	data, ct, err := p.s3.GetObject(ctx, req.S3Key)
	if err != nil {
		return fmt.Errorf("download: %w", err)
	}
	if p.maxFileMB > 0 && len(data) > p.maxFileMB*1024*1024 {
		return fmt.Errorf("%w: %d bytes (limit %d MB)", domain.ErrTooLarge, len(data), p.maxFileMB)
	}
	mime := req.MimeType
	if mime == "" {
		mime = ct
	}

	text, err := p.extractors.ExtractWithFilename(ctx, mime, req.Filename, data)
	if err != nil {
		return fmt.Errorf("extract: %w", err)
	}
	log.Info("extracted", "chars", len(text), "mime", mime)

	// 2. Chunk
	pieces := p.chunker.Split(text)
	if len(pieces) == 0 {
		return fmt.Errorf("no content extracted")
	}
	log.Info("chunked", "chunks", len(pieces))

	// 3. Embed (in batches) and persist as we go.
	if err := p.docs.UpdateStatus(ctx, req.DocumentID, domain.StatusEmbedding, nil, nil); err != nil {
		return err
	}

	milvusRows := make([]milvus.ChunkRow, 0, len(pieces))
	for batchStart := 0; batchStart < len(pieces); batchStart += embedBatchSize {
		batchEnd := batchStart + embedBatchSize
		if batchEnd > len(pieces) {
			batchEnd = len(pieces)
		}
		batch := pieces[batchStart:batchEnd]

		inputs := make([]string, len(batch))
		for i, b := range batch {
			inputs[i] = b.Content
		}
		vectors, err := p.llm.Embed(ctx, inputs)
		if err != nil {
			return fmt.Errorf("embed batch %d-%d: %w", batchStart, batchEnd, err)
		}
		for i, v := range vectors {
			if len(v) != p.llm.EmbedDims() {
				return fmt.Errorf("embedding dim mismatch: got %d, want %d", len(v), p.llm.EmbedDims())
			}
			idx := batchStart + i
			milvusRows = append(milvusRows, studyChunkRow(
				req.DocumentID, req.WorkspaceID, idx, batch[i].Content, v,
			))
		}
	}

	if err := p.milvus.InsertChunks(ctx, milvusRows); err != nil {
		return fmt.Errorf("persist milvus chunks: %w", err)
	}
	log.Info("milvus_inserted", "chunks", len(milvusRows))

	total := len(milvusRows)
	if err := p.docs.UpdateStatus(ctx, req.DocumentID, domain.StatusReady, &total, nil); err != nil {
		return err
	}
	return nil
}
