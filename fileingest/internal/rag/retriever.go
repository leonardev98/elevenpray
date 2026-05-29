// Package rag implements retrieval-augmented generation (Milvus for study docs).
package rag

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/storage/milvus"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
)

// Retriever turns a natural-language query into a list of relevant chunks.
type Retriever struct {
	llm    *llm.Client
	milvus *milvus.Client
	docs   *postgres.DocumentRepo
	topK   int
}

func NewRetriever(client *llm.Client, mv *milvus.Client, docs *postgres.DocumentRepo, defaultTopK int) *Retriever {
	if defaultTopK <= 0 {
		defaultTopK = 5
	}
	return &Retriever{llm: client, milvus: mv, docs: docs, topK: defaultTopK}
}

// Query embeds the input and returns the top-K matching chunks for a workspace.
func (r *Retriever) Query(
	ctx context.Context,
	workspaceID uuid.UUID,
	documentIDs []uuid.UUID,
	query string,
	topK int,
) ([]domain.RetrievedChunk, error) {
	if query == "" {
		return nil, fmt.Errorf("empty query")
	}
	if topK <= 0 {
		topK = r.topK
	}

	vectors, err := r.llm.Embed(ctx, []string{query})
	if err != nil {
		return nil, fmt.Errorf("embed query: %w", err)
	}
	if len(vectors) != 1 {
		return nil, fmt.Errorf("embed returned %d vectors, want 1", len(vectors))
	}

	rows, err := r.milvus.SearchStudyDocuments(ctx, workspaceID, documentIDs, vectors[0], topK)
	if err != nil {
		return nil, err
	}

	filenames := map[string]string{}
	if r.docs != nil && len(rows) > 0 {
		ids := make([]uuid.UUID, 0, len(rows))
		seen := map[string]struct{}{}
		for _, row := range rows {
			if _, ok := seen[row.ResourceID]; ok {
				continue
			}
			seen[row.ResourceID] = struct{}{}
			id, parseErr := uuid.Parse(row.ResourceID)
			if parseErr != nil {
				continue
			}
			ids = append(ids, id)
		}
		if m, err := r.docs.FilenamesByIDs(ctx, ids); err == nil {
			filenames = m
		}
	}

	out := make([]domain.RetrievedChunk, 0, len(rows))
	for _, row := range rows {
		fn := filenames[row.ResourceID]
		if fn == "" {
			fn = row.ResourceID
		}
		out = append(out, domain.RetrievedChunk{
			Chunk: domain.Chunk{
				Content: row.Content,
				Index:   int(row.ChunkIndex),
			},
			DocumentFilename: fn,
		})
	}
	return out, nil
}
