-- =============================================================================
-- ElevenPray - DDL COMPLETO (una sola ejecución)
-- =============================================================================
-- Copia todo este archivo y ejecútalo en el SQL Editor de Supabase (o DBeaver).
-- Crea todas las tablas en orden; es idempotente (CREATE IF NOT EXISTS, etc.).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Función global para updated_at (se usa en varias tablas)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. USUARIOS Y RUTINAS LEGACY
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

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
DROP TRIGGER IF EXISTS tr_routines_updated_at ON routines;
CREATE TRIGGER tr_routines_updated_at BEFORE UPDATE ON routines FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. TÓPICOS Y TOPIC_ENTRIES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rutina', 'notas', 'lista', 'meta', 'curso', 'otro')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics (user_id);

ALTER TABLE routines ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics (id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_routines_topic_id ON routines (topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_routines_topic_year_week ON routines (topic_id, year, week_number);

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
DROP TRIGGER IF EXISTS tr_topic_entries_updated_at ON topic_entries;
CREATE TRIGGER tr_topic_entries_updated_at BEFORE UPDATE ON topic_entries FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- 3. WORKSPACES (block system)
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spaces_workspace_id ON spaces (workspace_id);

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

CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_containers_page_id ON containers (page_id);

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

DROP TRIGGER IF EXISTS tr_workspaces_updated_at ON workspaces;
CREATE TRIGGER tr_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS tr_pages_updated_at ON pages;
CREATE TRIGGER tr_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS tr_blocks_updated_at ON blocks;
CREATE TRIGGER tr_blocks_updated_at BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS tr_routine_templates_updated_at ON routine_templates;
CREATE TRIGGER tr_routine_templates_updated_at BEFORE UPDATE ON routine_templates FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- 4. TIPOS Y SUBTIPOS DE WORKSPACE
-- =============================================================================

CREATE TABLE IF NOT EXISTS workspace_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  capabilities JSONB NOT NULL DEFAULT '{}',
  default_spaces JSONB,
  dashboard_config JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspace_types_code ON workspace_types (code);

CREATE TABLE IF NOT EXISTS workspace_subtypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_type_id UUID NOT NULL REFERENCES workspace_types (id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  default_pages JSONB,
  default_blocks JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_type_id, code)
);
CREATE INDEX IF NOT EXISTS idx_workspace_subtypes_workspace_type_id ON workspace_subtypes (workspace_type_id);

DROP TRIGGER IF EXISTS tr_workspace_types_updated_at ON workspace_types;
CREATE TRIGGER tr_workspace_types_updated_at BEFORE UPDATE ON workspace_types FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS tr_workspace_subtypes_updated_at ON workspace_subtypes;
CREATE TRIGGER tr_workspace_subtypes_updated_at BEFORE UPDATE ON workspace_subtypes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

INSERT INTO workspace_types (code, label, capabilities, sort_order)
VALUES
  ('skincare', 'Skincare', '{"hasRoutine": true}', 0),
  ('university', 'Universidad', '{"hasRoutine": false}', 1),
  ('work', 'Trabajo', '{"hasRoutine": false, "hasDashboardWidgets": true}', 2),
  ('fitness', 'Fitness', '{"hasRoutine": true}', 3),
  ('general', 'General', '{"hasRoutine": true}', 4)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  capabilities = EXCLUDED.capabilities,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'programmer', 'Programador', '[{"title": "Daily Log", "position": 0}, {"title": "Code Notes", "position": 1}, {"title": "Ideas", "position": 2}, {"title": "Learning", "position": 3}]'::jsonb, 0
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'remote_worker', 'Trabajo remoto', '[{"title": "Daily Log", "position": 0}, {"title": "Meetings", "position": 1}, {"title": "Tasks", "position": 2}, {"title": "Time tracking", "position": 3}]'::jsonb, 1
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'bodybuilding', 'Bodybuilding', '[]'::jsonb, 0
FROM workspace_types wt WHERE wt.code = 'fitness'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'running', 'Running', '[]'::jsonb, 1
FROM workspace_types wt WHERE wt.code = 'fitness'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'acne', 'Acné', '[]'::jsonb, 0
FROM workspace_types wt WHERE wt.code = 'skincare'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'anti_aging', 'Anti-aging', '[]'::jsonb, 1
FROM workspace_types wt WHERE wt.code = 'skincare'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

-- Columna subtype en workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS workspace_subtype_id UUID REFERENCES workspace_subtypes (id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_workspace_subtype_id ON workspaces (workspace_subtype_id);

-- Default pages para skincare (Overview, Basics, etc.)
UPDATE workspace_subtypes
SET default_pages = '[
  {"title": "Overview", "position": 0},
  {"title": "Basics", "position": 1},
  {"title": "Ingredients", "position": 2},
  {"title": "Personal learnings", "position": 3},
  {"title": "Saved inspiration", "position": 4},
  {"title": "Derm notes", "position": 5}
]'::jsonb,
  updated_at = now()
WHERE workspace_type_id = (SELECT id FROM workspace_types WHERE code = 'skincare');

-- =============================================================================
-- 5. PREFERENCIAS Y ESTADO DE UI
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  favorite BOOLEAN NOT NULL DEFAULT false,
  visible_on_dashboard BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_user_id ON user_workspace_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_workspace_id ON user_workspace_preferences (workspace_id);

-- Si la tabla ya existía sin onboarding, añadir columnas
ALTER TABLE user_workspace_preferences ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE user_workspace_preferences ADD COLUMN IF NOT EXISTS onboarding_answers JSONB;

CREATE TABLE IF NOT EXISTS user_ui_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE UNIQUE,
  current_workspace_id UUID REFERENCES workspaces (id) ON DELETE SET NULL,
  selected_workspace_ids UUID[] NOT NULL DEFAULT '{}',
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_ui_state_user_id ON user_ui_state (user_id);

DROP TRIGGER IF EXISTS tr_user_workspace_preferences_updated_at ON user_workspace_preferences;
CREATE TRIGGER tr_user_workspace_preferences_updated_at BEFORE UPDATE ON user_workspace_preferences FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS tr_user_ui_state_updated_at ON user_ui_state;
CREATE TRIGGER tr_user_ui_state_updated_at BEFORE UPDATE ON user_ui_state FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- 6. MÓDULOS WORKSPACE (Skincare / Product Vault, Journal, Photos)
-- =============================================================================

CREATE TABLE IF NOT EXISTS workspace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  texture_format TEXT,
  main_ingredients JSONB,
  usage_time TEXT,
  status TEXT NOT NULL,
  date_opened DATE,
  expiration_date DATE,
  notes TEXT,
  rating INTEGER,
  reaction_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_products_category_check
    CHECK (category IN (
      'cleanser', 'moisturizer', 'sunscreen', 'serum', 'retinoid', 'exfoliant',
      'toner', 'eye_care', 'spot_treatment', 'mask', 'oil', 'essence', 'balm'
    )),
  CONSTRAINT workspace_products_status_check
    CHECK (status IN ('active', 'testing', 'paused', 'finished', 'wishlist')),
  CONSTRAINT workspace_products_usage_time_check
    CHECK (usage_time IS NULL OR usage_time IN ('am', 'pm', 'both')),
  CONSTRAINT workspace_products_rating_check
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);
CREATE INDEX IF NOT EXISTS idx_workspace_products_workspace_id ON workspace_products (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_products_status ON workspace_products (workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_workspace_products_category ON workspace_products (workspace_id, category);
DROP TRIGGER IF EXISTS tr_workspace_products_updated_at ON workspace_products;
CREATE TRIGGER tr_workspace_products_updated_at BEFORE UPDATE ON workspace_products FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS workspace_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workspace_checkins_workspace_id ON workspace_checkins (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_checkins_date ON workspace_checkins (workspace_id, checkin_date DESC);
DROP TRIGGER IF EXISTS tr_workspace_checkins_updated_at ON workspace_checkins;
CREATE TRIGGER tr_workspace_checkins_updated_at BEFORE UPDATE ON workspace_checkins FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS workspace_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  photo_date DATE NOT NULL,
  angle TEXT NOT NULL,
  notes TEXT,
  concern_tags JSONB,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_photos_angle_check
    CHECK (angle IN ('front', 'left', 'right'))
);
CREATE INDEX IF NOT EXISTS idx_workspace_photos_workspace_id ON workspace_photos (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_photos_date ON workspace_photos (workspace_id, photo_date DESC);
DROP TRIGGER IF EXISTS tr_workspace_photos_updated_at ON workspace_photos;
CREATE TRIGGER tr_workspace_photos_updated_at BEFORE UPDATE ON workspace_photos FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- =============================================================================
-- FIN DDL COMPLETO
-- =============================================================================
