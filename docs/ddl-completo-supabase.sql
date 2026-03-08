-- ElevenPray - DDL completo para Supabase (PostgreSQL)
-- Ejecutar TODO en el SQL Editor de Supabase (una sola vez).
-- Orden: users → routines → topics → alter routines (topic_id) → topic_entries

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------------------------------------------------------------------------
-- 2. routines
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

-- ---------------------------------------------------------------------------
-- 3. topics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rutina', 'notas', 'lista', 'meta', 'curso', 'otro')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics (user_id);

-- ---------------------------------------------------------------------------
-- 4. routines.topic_id
-- ---------------------------------------------------------------------------
ALTER TABLE routines
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics (id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_routines_topic_id ON routines (topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_routines_topic_year_week ON routines (topic_id, year, week_number);

-- ---------------------------------------------------------------------------
-- 5. topic_entries
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Borrar todos los usuarios (y datos relacionados) para volver a registrarse
-- Ejecutar solo si quieres dejar la BD limpia y crear un usuario nuevo.
-- ---------------------------------------------------------------------------
-- DELETE FROM topic_entries;
-- DELETE FROM routines;
-- DELETE FROM topics;
-- DELETE FROM users;
