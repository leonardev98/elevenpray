-- ElevenPray - workspace_types y workspace_subtypes (Type Registry)
-- Ejecutar después del esquema workspaces. No modifica workspaces existentes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. workspace_types
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2. workspace_subtypes
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3. Triggers updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_workspace_types_updated_at ON workspace_types;
CREATE TRIGGER tr_workspace_types_updated_at BEFORE UPDATE ON workspace_types FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS tr_workspace_subtypes_updated_at ON workspace_subtypes;
CREATE TRIGGER tr_workspace_subtypes_updated_at BEFORE UPDATE ON workspace_subtypes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Seed workspace_types (idempotent by code)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5. Seed workspace_subtypes (ejemplos: work y fitness)
-- ---------------------------------------------------------------------------
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
