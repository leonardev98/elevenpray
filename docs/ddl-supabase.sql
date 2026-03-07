-- ElevenPray - DDL para Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase (SQL Editor > New query) o en DBeaver.

-- Si usas la API de Supabase (Auth, Realtime), revisa RLS (Row Level Security).
-- Si solo conectas con connection string desde NestJS, estas tablas bastan.

-- Extensión para generar UUIDs (Supabase suele tenerla ya)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tabla: users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para búsqueda por email (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------------------------------------------------------------------------
-- Tabla: routines
-- Estructura de days (JSONB): { "monday": { "blocks": [{ "type": "heading"|"list"|"text", "content": "..." }] }, ... }
-- ---------------------------------------------------------------------------
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

-- Índices para listar rutinas por usuario
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines (user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_year_week ON routines (user_id, year, week_number);

-- Trigger para actualizar updated_at en routines
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

-- ---------------------------------------------------------------------------
-- (Opcional) Tabla: topics
-- Para los tópicos del aside del frontend (ahora en localStorage)
-- Si más adelante quieres persistirlos en la BD:
-- ---------------------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS topics (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
--   title TEXT NOT NULL,
--   type TEXT NOT NULL CHECK (type IN ('rutina', 'notas', 'lista', 'meta', 'otro')),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );
-- CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics (user_id);
