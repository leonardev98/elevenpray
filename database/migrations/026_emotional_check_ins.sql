-- ElevenPray - Migración 026: check-ins emocionales del estudiante (Bienestar)

CREATE TABLE IF NOT EXISTS emotional_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  mood VARCHAR(20) NOT NULL,
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_emotional_check_ins_user_date
  ON emotional_check_ins (user_id, check_in_date DESC);
