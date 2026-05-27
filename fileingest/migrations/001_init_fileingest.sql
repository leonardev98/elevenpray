-- fileingest schema: documents + chunks with pgvector
-- Run once in Supabase SQL editor or via `make migrate`.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS fileingest_documents (
    id            UUID PRIMARY KEY,
    workspace_id  UUID NOT NULL,
    user_id       UUID NOT NULL,
    source_uri    TEXT NOT NULL,
    filename      TEXT NOT NULL,
    mime_type     TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','extracting','embedding','ready','failed')),
    total_chunks  INT,
    error         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fileingest_documents_workspace_idx
    ON fileingest_documents (workspace_id);
CREATE INDEX IF NOT EXISTS fileingest_documents_user_idx
    ON fileingest_documents (user_id);
CREATE INDEX IF NOT EXISTS fileingest_documents_status_idx
    ON fileingest_documents (status);

CREATE TABLE IF NOT EXISTS fileingest_chunks (
    id           UUID PRIMARY KEY,
    document_id  UUID NOT NULL REFERENCES fileingest_documents(id) ON DELETE CASCADE,
    chunk_index  INT NOT NULL,
    content      TEXT NOT NULL,
    token_count  INT,
    embedding    vector(1536),
    metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS fileingest_chunks_document_idx
    ON fileingest_chunks (document_id);

-- ivfflat needs at least one row before it can be used efficiently; lists=100
-- is a safe default for medium corpora. Tune later with ANALYZE + EXPLAIN.
CREATE INDEX IF NOT EXISTS fileingest_chunks_embedding_idx
    ON fileingest_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
