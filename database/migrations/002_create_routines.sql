-- ElevenPray - Migración 002: tabla routines
-- Estructura de days (JSONB): { "monday": { "blocks": [{ "type": "heading"|"list"|"text", "content": "..." }] }, ... }

CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  week_label TEXT NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  days JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines (user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_year_week ON routines (user_id, year, week_number);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_routines_updated_at ON routines;
CREATE TRIGGER tr_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
