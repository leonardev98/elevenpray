package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"

	"github.com/elevenpray/fileingest/internal/domain"
)

// ChunkRepo persists chunks and exposes top-K similarity search.
type ChunkRepo struct {
	pool *pgxpool.Pool
}

func NewChunkRepo(pool *pgxpool.Pool) *ChunkRepo {
	return &ChunkRepo{pool: pool}
}

// InsertBatch inserts many chunks for the same document. Uses a single
// multi-value INSERT to limit round-trips.
func (r *ChunkRepo) InsertBatch(ctx context.Context, chunks []domain.Chunk) error {
	if len(chunks) == 0 {
		return nil
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	const q = `
INSERT INTO fileingest_chunks
    (id, document_id, chunk_index, content, token_count, embedding, metadata)
VALUES ($1,$2,$3,$4,$5,$6,$7)`
	for _, c := range chunks {
		meta := c.Metadata
		if meta == nil {
			meta = map[string]any{}
		}
		emb := pgvector.NewVector(c.Embedding)
		// Pass map[string]any (not []byte): pgx encodes []byte as BYTEA, which breaks JSONB.
		if _, err := tx.Exec(ctx, q,
			c.ID, c.DocumentID, c.Index, c.Content, c.TokenCount, emb, meta); err != nil {
			return fmt.Errorf("insert chunk %d: %w", c.Index, err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit chunks: %w", err)
	}
	return nil
}

// SearchOptions narrows similarity search to a workspace and (optionally) a set
// of document IDs.
type SearchOptions struct {
	WorkspaceID uuid.UUID
	DocumentIDs []uuid.UUID
	TopK        int
}

// SearchSimilar returns the top-K chunks most similar to queryEmbedding,
// constrained to the given workspace and (optional) document scope.
func (r *ChunkRepo) SearchSimilar(
	ctx context.Context,
	queryEmbedding []float32,
	opts SearchOptions,
) ([]domain.RetrievedChunk, error) {
	if opts.TopK <= 0 {
		opts.TopK = 5
	}

	args := []any{pgvector.NewVector(queryEmbedding), opts.WorkspaceID, opts.TopK}
	docFilter := ""
	if len(opts.DocumentIDs) > 0 {
		docFilter = "AND c.document_id = ANY($4)"
		args = append(args, opts.DocumentIDs)
	}

	q := fmt.Sprintf(`
SELECT c.id, c.document_id, c.chunk_index, c.content, c.token_count, c.metadata,
       d.filename, 1 - (c.embedding <=> $1) AS similarity
FROM fileingest_chunks c
JOIN fileingest_documents d ON d.id = c.document_id
WHERE d.workspace_id = $2
  AND d.status = 'ready'
  %s
ORDER BY c.embedding <=> $1
LIMIT $3`, docFilter)

	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("similarity query: %w", err)
	}
	defer rows.Close()

	var out []domain.RetrievedChunk
	for rows.Next() {
		var rc domain.RetrievedChunk
		var metaJSON []byte
		if err := rows.Scan(
			&rc.ID, &rc.DocumentID, &rc.Index, &rc.Content, &rc.TokenCount,
			&metaJSON, &rc.DocumentFilename, &rc.Similarity,
		); err != nil {
			return nil, fmt.Errorf("scan chunk: %w", err)
		}
		if len(metaJSON) > 0 {
			_ = json.Unmarshal(metaJSON, &rc.Metadata)
		}
		out = append(out, rc)
	}
	return out, rows.Err()
}
