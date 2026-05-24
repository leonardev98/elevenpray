-- ElevenPray - Migración 014: soporte vista cursos (código corto + listados)
-- Idempotente: seguro si ya se aplicó manualmente en algún entorno.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS code text;

COMMENT ON COLUMN public.courses.code IS 'Código o sigla del curso (ej. CS101), opcional.';

CREATE INDEX IF NOT EXISTS idx_courses_workspace_archived_sort
  ON public.courses (workspace_id, archived, sort_order, created_at);
