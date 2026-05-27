package domain

import (
	"time"

	"github.com/google/uuid"
)

// Chunk is a piece of content extracted from a document plus its embedding.
type Chunk struct {
	ID         uuid.UUID
	DocumentID uuid.UUID
	Index      int
	Content    string
	TokenCount int
	Embedding  []float32
	Metadata   map[string]any
	CreatedAt  time.Time
}

// RetrievedChunk extends Chunk with similarity context for RAG responses.
type RetrievedChunk struct {
	Chunk
	DocumentFilename string
	Similarity       float32
}
