package ingest

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/ingest/chunker"
	"github.com/elevenpray/fileingest/internal/ingest/extractor"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/notify"
	"github.com/elevenpray/fileingest/internal/storage/milvus"
	s3client "github.com/elevenpray/fileingest/internal/storage/s3"
)

// ResourceUploadRequest is the input for the course/class resource pipeline.
type ResourceUploadRequest struct {
	CourseID string
	ClassID  string
	File     ValidatedResourceFile
	Data     []byte
}

// ResourceUploadResult is returned to the HTTP client on success.
type ResourceUploadResult struct {
	ResourceID string
	KeyURL     string
	S3Key      string
}

// ResourcePipeline runs validate → S3 → extract → chunk → embed → Milvus → webhook.
type ResourcePipeline struct {
	logger        *slog.Logger
	s3            *s3client.Client
	s3Region      string
	s3PublicBase  string
	pdf           extractor.Extractor
	docx          extractor.Extractor
	chunker       *chunker.Recursive
	llm           *llm.Client
	milvus        *milvus.Client
	backend       *notify.BackendClient
	maxFileMB int
}

// MaxFileMB exposes the upload size limit for handlers.
func (p *ResourcePipeline) MaxFileMB() int {
	return p.maxFileMB
}

// NewResourcePipeline wires dependencies for course/class uploads.
func NewResourcePipeline(
	logger *slog.Logger,
	s3 *s3client.Client,
	s3Region, s3PublicBase string,
	chunker *chunker.Recursive,
	llm *llm.Client,
	mv *milvus.Client,
	backend *notify.BackendClient,
	maxFileMB int,
) *ResourcePipeline {
	return &ResourcePipeline{
		logger:       logger,
		s3:           s3,
		s3Region:     s3Region,
		s3PublicBase: s3PublicBase,
		pdf:          &extractor.PDFExtractor{},
		docx:         &extractor.DOCXExtractor{},
		chunker:      chunker,
		llm:          llm,
		milvus:       mv,
		backend:      backend,
		maxFileMB:    maxFileMB,
	}
}

// Run executes all steps sequentially; aborts on first error.
func (p *ResourcePipeline) Run(ctx context.Context, req ResourceUploadRequest) (ResourceUploadResult, error) {
	start := time.Now()
	resourceID := uuid.New()

	log := p.logger.With(
		"resource_id", resourceID.String(),
		"course_id", req.CourseID,
		"class_id", req.ClassID,
		"filename", req.File.Filename,
	)

	if _, err := ValidateResourceFile(req.File.Filename, req.File.ContentType, len(req.Data), p.maxFileMB); err != nil {
		log.Error("resource_validate_failed", "err", err)
		return ResourceUploadResult{}, err
	}
	log.Info("resource_validated", "mime", req.File.MimeType, "bytes", len(req.Data))

	s3Key := fmt.Sprintf("recursos/%s/%s/%s.%s", req.CourseID, req.ClassID, resourceID.String(), req.File.Extension)
	if err := p.s3.PutObject(ctx, s3Key, req.File.ContentType, req.Data); err != nil {
		log.Error("resource_s3_upload_failed", "s3_key", s3Key, "err", err)
		return ResourceUploadResult{}, fmt.Errorf("s3 upload: %w", err)
	}
	keyURL := p.s3.PublicURL(p.s3Region, p.s3PublicBase, s3Key)
	log.Info("resource_s3_uploaded", "s3_key", s3Key, "key_url", keyURL)

	text, err := p.extractText(ctx, req.File.MimeType, req.Data)
	if err != nil {
		log.Error("resource_extract_failed", "err", err)
		return ResourceUploadResult{}, fmt.Errorf("extract: %w", err)
	}
	log.Info("resource_extracted", "chars", len(text))

	pieces := p.chunker.Split(text)
	if len(pieces) == 0 {
		err := fmt.Errorf("no content extracted")
		log.Error("resource_chunk_failed", "err", err)
		return ResourceUploadResult{}, err
	}
	log.Info("resource_chunked", "chunks", len(pieces))

	rows := make([]milvus.ChunkRow, 0, len(pieces))
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
			log.Error("resource_embed_failed", "batch_start", batchStart, "err", err)
			return ResourceUploadResult{}, fmt.Errorf("embed: %w", err)
		}
		if len(vectors) != len(batch) {
			return ResourceUploadResult{}, fmt.Errorf("embed returned %d vectors, want %d", len(vectors), len(batch))
		}
		for i, piece := range batch {
			idx := int64(batchStart + i)
			rows = append(rows, milvus.ChunkRow{
				ID:         fmt.Sprintf("%s_%d", resourceID.String(), idx),
				ResourceID: resourceID.String(),
				CourseID:   req.CourseID,
				ClassID:    req.ClassID,
				ChunkIndex: idx,
				Content:    piece.Content,
				Embedding:  vectors[i],
			})
		}
	}
	log.Info("resource_embedded", "chunks", len(rows))

	if err := p.milvus.InsertChunks(ctx, rows); err != nil {
		log.Error("resource_milvus_failed", "err", err)
		return ResourceUploadResult{}, fmt.Errorf("milvus: %w", err)
	}
	log.Info("resource_milvus_inserted", "chunks", len(rows))

	payload := notify.ResourceIngested{
		CourseID:   req.CourseID,
		ClassID:    req.ClassID,
		ResourceID: resourceID.String(),
		KeyURL:     keyURL,
	}
	if err := p.backend.NotifyResourceIngested(ctx, payload); err != nil {
		log.Error("resource_webhook_failed", "err", err)
		return ResourceUploadResult{}, fmt.Errorf("backend webhook: %w", err)
	}
	log.Info("resource_webhook_ok")

	log.Info("resource_ingest_done", "duration_ms", time.Since(start).Milliseconds())

	return ResourceUploadResult{
		ResourceID: resourceID.String(),
		KeyURL:     keyURL,
		S3Key:      s3Key,
	}, nil
}

func (p *ResourcePipeline) extractText(ctx context.Context, mime string, data []byte) (string, error) {
	switch mime {
	case mimePDF:
		return p.pdf.Extract(ctx, data)
	case mimeDOCX:
		return p.docx.Extract(ctx, data)
	default:
		return "", fmt.Errorf("unsupported mime for resource pipeline: %s", mime)
	}
}
