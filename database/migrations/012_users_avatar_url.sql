-- ElevenPray - Migración 012: avatar_url en users (foto de perfil en S3)
-- Ejecutar en Supabase SQL Editor o con tu cliente PostgreSQL.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
