-- ElevenPray - Esquema Workspaces (Block System)
-- Ejecutar DESPUÉS de ddl-workspaces-drop.sql. Requiere tabla users existente.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. workspaces
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  workspace_type TEXT NOT NULL CHECK (workspace_type IN ('skincare', 'university', 'work', 'fitness', 'general')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces (user_id);

-- ---------------------------------------------------------------------------
-- 2. spaces
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spaces_workspace_id ON spaces (workspace_id);

-- ---------------------------------------------------------------------------
-- 3. pages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces (id) ON DELETE SET NULL,
  parent_page_id UUID REFERENCES pages (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pages_workspace_id ON pages (workspace_id);
CREATE INDEX IF NOT EXISTS idx_pages_space_id ON pages (space_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_page_id ON pages (parent_page_id);

-- ---------------------------------------------------------------------------
-- 4. containers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_containers_page_id ON containers (page_id);

-- ---------------------------------------------------------------------------
-- 5. blocks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  container_id UUID REFERENCES containers (id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'text', 'heading', 'list', 'checklist', 'image', 'file', 'link', 'code',
    'callout', 'table', 'database', 'container', 'weekly_routine'
  )),
  content JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks (page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_container_id ON blocks (container_id);

-- ---------------------------------------------------------------------------
-- 6. routine_templates (rutina semanal por workspace)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routine_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  week_label TEXT NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  days JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, year, week_number)
);
CREATE INDEX IF NOT EXISTS idx_routine_templates_workspace_id ON routine_templates (workspace_id);
CREATE INDEX IF NOT EXISTS idx_routine_templates_user_id ON routine_templates (user_id);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_workspaces_updated_at ON workspaces;
CREATE TRIGGER tr_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS tr_pages_updated_at ON pages;
CREATE TRIGGER tr_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS tr_blocks_updated_at ON blocks;
CREATE TRIGGER tr_blocks_updated_at BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS tr_routine_templates_updated_at ON routine_templates;
CREATE TRIGGER tr_routine_templates_updated_at BEFORE UPDATE ON routine_templates FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
