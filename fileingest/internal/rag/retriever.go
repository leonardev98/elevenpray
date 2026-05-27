// Package rag implements retrieval-augmented generation on top of pgvector.
package rag

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
)

// Retriever turns a natural-language query into a list of relevant chunks.
type Retriever struct {
	llm    *llm.Client
	chunks *postgres.ChunkRepo
	topK   int
}

func NewRetriever(client *llm.Client, chunks *postgres.ChunkRepo, defaultTopK int) *Retriever {
	if defaultTopK <= 0 {
		defaultTopK = 5
	}
	return &Retriever{llm: client, chunks: chunks, topK: defaultTopK}
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

	return r.chunks.SearchSimilar(ctx, vectors[0], postgres.SearchOptions{
		WorkspaceID: workspaceID,
		DocumentIDs: documentIDs,
		TopK:        topK,
	})
}
