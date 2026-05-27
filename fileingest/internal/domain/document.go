package domain

import (
	"time"

	"github.com/google/uuid"
)

// DocumentStatus represents the lifecycle of an ingested document.
type DocumentStatus string

const (
	StatusPending    DocumentStatus = "pending"
	StatusExtracting DocumentStatus = "extracting"
	StatusEmbedding  DocumentStatus = "embedding"
	StatusReady      DocumentStatus = "ready"
	StatusFailed     DocumentStatus = "failed"
)

// Document is the canonical representation of an ingested file.
type Document struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	UserID      uuid.UUID
	SourceURI   string
	Filename    string
	MimeType    string
	Status      DocumentStatus
	TotalChunks *int
	Error       *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
