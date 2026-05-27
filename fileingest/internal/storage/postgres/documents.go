package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/elevenpray/fileingest/internal/domain"
)

// DocumentRepo persists Document rows.
type DocumentRepo struct {
	pool *pgxpool.Pool
}

func NewDocumentRepo(pool *pgxpool.Pool) *DocumentRepo {
	return &DocumentRepo{pool: pool}
}

// Create inserts a new document row. The caller pre-populates the ID and basic
// metadata; status defaults to "pending".
func (r *DocumentRepo) Create(ctx context.Context, d *domain.Document) error {
	const q = `
INSERT INTO fileingest_documents
    (id, workspace_id, user_id, source_uri, filename, mime_type, status)
VALUES ($1,$2,$3,$4,$5,$6,$7)`
	if d.Status == "" {
		d.Status = domain.StatusPending
	}
	_, err := r.pool.Exec(ctx, q,
		d.ID, d.WorkspaceID, d.UserID, d.SourceURI, d.Filename, d.MimeType, string(d.Status))
	if err != nil {
		return fmt.Errorf("insert document: %w", err)
	}
	return nil
}

// UpdateStatus writes a new status (and optional error / total_chunks) atomically.
func (r *DocumentRepo) UpdateStatus(
	ctx context.Context,
	id uuid.UUID,
	status domain.DocumentStatus,
	totalChunks *int,
	errMsg *string,
) error {
	const q = `
UPDATE fileingest_documents
SET status = $2,
    total_chunks = COALESCE($3, total_chunks),
    error = $4,
    updated_at = now()
WHERE id = $1`
	_, err := r.pool.Exec(ctx, q, id, string(status), totalChunks, errMsg)
	if err != nil {
		return fmt.Errorf("update document status: %w", err)
	}
	return nil
}

// Get returns a single document by id.
func (r *DocumentRepo) Get(ctx context.Context, id uuid.UUID) (*domain.Document, error) {
	const q = `
SELECT id, workspace_id, user_id, source_uri, filename, mime_type, status,
       total_chunks, error, created_at, updated_at
FROM fileingest_documents
WHERE id = $1`
	row := r.pool.QueryRow(ctx, q, id)
	var d domain.Document
	var status string
	err := row.Scan(&d.ID, &d.WorkspaceID, &d.UserID, &d.SourceURI, &d.Filename,
		&d.MimeType, &status, &d.TotalChunks, &d.Error, &d.CreatedAt, &d.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("scan document: %w", err)
	}
	d.Status = domain.DocumentStatus(status)
	return &d, nil
}
