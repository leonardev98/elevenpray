-- ElevenPray - Migración 028: referidos entre usuarios

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_referred_by
  ON users (referred_by_user_id);

CREATE INDEX IF NOT EXISTS idx_users_referred_at
  ON users (referred_by_user_id, referred_at DESC);
