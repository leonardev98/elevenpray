-- ElevenPray - Migración 006: schema developer prompts (carpetas, categorías, proyectos, prompts, tags)
-- Ejecutar después de 001_create_users.sql. Crea tablas para el módulo Prompts del workspace de programador.

-- Categorías globales (referencia)
CREATE TABLE IF NOT EXISTS prompt_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_categories_code ON prompt_categories (code);

-- Carpetas por usuario
CREATE TABLE IF NOT EXISTS prompt_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_folders_user_id ON prompt_folders (user_id);

DROP TRIGGER IF EXISTS tr_prompt_folders_updated_at ON prompt_folders;
CREATE TRIGGER tr_prompt_folders_updated_at
  BEFORE UPDATE ON prompt_folders
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Proyectos del developer workspace (por usuario)
CREATE TABLE IF NOT EXISTS developer_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  repository_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_developer_projects_user_id ON developer_projects (user_id);

DROP TRIGGER IF EXISTS tr_developer_projects_updated_at ON developer_projects;
CREATE TRIGGER tr_developer_projects_updated_at
  BEFORE UPDATE ON developer_projects
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Tags globales (nombre único) para prompts
CREATE TABLE IF NOT EXISTS prompt_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_tags_name ON prompt_tags (name);

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  folder_id UUID REFERENCES prompt_folders (id) ON DELETE SET NULL,
  category_id UUID REFERENCES prompt_categories (id) ON DELETE SET NULL,
  project_id UUID REFERENCES developer_projects (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  content TEXT NOT NULL,
  prompt_type TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  repository_name TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT uq_prompts_user_slug UNIQUE (user_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts (user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_folder_id ON prompts (folder_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts (category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON prompts (project_id);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts (status);
CREATE INDEX IF NOT EXISTS idx_prompts_is_favorite ON prompts (is_favorite);
CREATE INDEX IF NOT EXISTS idx_prompts_last_used_at ON prompts (last_used_at);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts (created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_deleted_at ON prompts (deleted_at) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS tr_prompts_updated_at ON prompts;
CREATE TRIGGER tr_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Relación N:M prompts <-> tags
CREATE TABLE IF NOT EXISTS prompt_tag_relations (
  prompt_id UUID NOT NULL REFERENCES prompts (id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES prompt_tags (id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_tag_relations_tag_id ON prompt_tag_relations (tag_id);
