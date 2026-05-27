-- PDFs procesados por fileingest, vinculados a un curso contenedor en study-university.

CREATE TABLE IF NOT EXISTS study_pdf_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    fileingest_document_id UUID NOT NULL,
    filename TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    summary_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS study_pdf_documents_workspace_user_idx
    ON study_pdf_documents (workspace_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS study_pdf_documents_fileingest_id_idx
    ON study_pdf_documents (fileingest_document_id);
