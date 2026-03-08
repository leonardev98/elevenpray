-- ElevenPray - Migración 005: entradas por fecha (cursos, eventos)
-- Para tópicos tipo "curso": el usuario elige un día y agrega una entrada (texto, opcionalmente imagen).

CREATE TABLE IF NOT EXISTS topic_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topic_entries_topic_id ON topic_entries (topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_entries_entry_date ON topic_entries (topic_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_topic_entries_user_date ON topic_entries (user_id, entry_date);

CREATE OR REPLACE FUNCTION set_topic_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_topic_entries_updated_at ON topic_entries;
CREATE TRIGGER tr_topic_entries_updated_at
  BEFORE UPDATE ON topic_entries
  FOR EACH ROW
  EXECUTE PROCEDURE set_topic_entries_updated_at();
