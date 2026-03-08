-- ElevenPray - Migración 003: tabla topics
-- Tópicos del usuario (Skincare, Gym, Cursos, etc.). Cada uno tiene tipo y orden en el aside.

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rutina', 'notas', 'lista', 'meta', 'curso', 'otro')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics (user_id);
