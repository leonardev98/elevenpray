-- ElevenPray - Migración 021: actividad diaria del estudiante (rachas, check-in, tareas)

CREATE TABLE IF NOT EXISTS user_daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  study BOOLEAN NOT NULL DEFAULT false,
  tasks BOOLEAN NOT NULL DEFAULT false,
  checkin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_date
  ON user_daily_activity (user_id, activity_date DESC);
