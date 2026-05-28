package rag

import (
	"context"
	"fmt"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/storage/milvus"
)

// MilvusRetriever searches course/class resource chunks in Milvus.
type MilvusRetriever struct {
	llm    *llm.Client
	milvus *milvus.Client
	topK   int
}

// NewMilvusRetriever builds a retriever backed by Milvus.
func NewMilvusRetriever(client *llm.Client, mv *milvus.Client, defaultTopK int) *MilvusRetriever {
	if defaultTopK <= 0 {
		defaultTopK = 5
	}
	return &MilvusRetriever{llm: client, milvus: mv, topK: defaultTopK}
}

// Query embeds the question and returns similar chunks for a course/class pair.
func (r *MilvusRetriever) Query(
	ctx context.Context,
	courseID, classID, question string,
	topK int,
) ([]domain.RetrievedChunk, error) {
	if question == "" {
		return nil, fmt.Errorf("empty query")
	}
	if topK <= 0 {
		topK = r.topK
	}

	vectors, err := r.llm.Embed(ctx, []string{question})
	if err != nil {
		return nil, fmt.Errorf("embed query: %w", err)
	}
	if len(vectors) != 1 {
		return nil, fmt.Errorf("embed returned %d vectors, want 1", len(vectors))
	}

	rows, err := r.milvus.SearchSimilar(ctx, courseID, classID, vectors[0], topK)
	if err != nil {
		return nil, err
	}

	out := make([]domain.RetrievedChunk, 0, len(rows))
	for _, row := range rows {
		out = append(out, domain.RetrievedChunk{
			Chunk: domain.Chunk{
				Content: row.Content,
			},
			DocumentFilename: row.ResourceID,
		})
	}
	return out, nil
}
