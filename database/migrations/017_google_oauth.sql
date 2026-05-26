-- ElevenPray - Migración 017: soporte de login con Google
-- 1) password_hash pasa a ser nullable (usuarios solo-Google no tienen contraseña).
-- 2) Nueva columna google_sub para enlazar la cuenta de Google de forma única.
-- Idempotente.

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users (google_sub)
  WHERE google_sub IS NOT NULL;
