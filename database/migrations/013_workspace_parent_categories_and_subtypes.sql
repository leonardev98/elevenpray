-- ElevenPray - Migración 013: Categorías padre (dominios) y subtipos por categoría
-- Estructura: WELLNESS, STUDY, WORK, GENERAL con sus subtipos.
-- Quita el tipo plano "general" de la lista única; General pasa a ser categoría con subtipos.

-- 0) Asegurar tabla de dominios y columna domain_id (por si no existen)
CREATE TABLE IF NOT EXISTS workspace_type_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE workspace_types ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES workspace_type_domains (id) ON DELETE SET NULL;

-- 1) Dominios (categorías padre)
INSERT INTO workspace_type_domains (code, label, sort_order)
VALUES ('wellness', 'Wellness', 0)
ON CONFLICT (code) DO NOTHING;
INSERT INTO workspace_type_domains (code, label, sort_order)
VALUES ('study', 'Study', 1)
ON CONFLICT (code) DO NOTHING;
INSERT INTO workspace_type_domains (code, label, sort_order)
VALUES ('work', 'Work', 2)
ON CONFLICT (code) DO NOTHING;
INSERT INTO workspace_type_domains (code, label, sort_order)
VALUES ('general', 'General', 3)
ON CONFLICT (code) DO NOTHING;

-- 2) Vincular tipos existentes a dominios (por code del dominio)
UPDATE workspace_types wt
SET domain_id = (SELECT id FROM workspace_type_domains WHERE code = 'wellness' LIMIT 1)
WHERE wt.code IN ('skincare', 'fitness');

UPDATE workspace_types wt
SET domain_id = (SELECT id FROM workspace_type_domains WHERE code = 'study' LIMIT 1)
WHERE wt.code = 'study';

UPDATE workspace_types wt
SET domain_id = (SELECT id FROM workspace_type_domains WHERE code = 'work' LIMIT 1)
WHERE wt.code = 'work';

UPDATE workspace_types wt
SET domain_id = (SELECT id FROM workspace_type_domains WHERE code = 'general' LIMIT 1)
WHERE wt.code = 'general';

-- 3) Nuevos tipos bajo WELLNESS (subtipos como tipos para crear workspace directo)
INSERT INTO workspace_types (code, label, capabilities, sort_order, domain_id)
SELECT 'nutrition', 'Nutrition', '{"hasRoutine": true}', 4, (SELECT id FROM workspace_type_domains WHERE code = 'wellness' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workspace_types WHERE code = 'nutrition');

INSERT INTO workspace_types (code, label, capabilities, sort_order, domain_id)
SELECT 'sleep', 'Sleep', '{"hasRoutine": true}', 5, (SELECT id FROM workspace_type_domains WHERE code = 'wellness' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workspace_types WHERE code = 'sleep');

INSERT INTO workspace_types (code, label, capabilities, sort_order, domain_id)
SELECT 'mental_health', 'Mental Health', '{"hasRoutine": true}', 6, (SELECT id FROM workspace_type_domains WHERE code = 'wellness' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM workspace_types WHERE code = 'mental_health');

-- 4) Subtipos bajo STUDY (university ya existe)
INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'courses', 'Courses', '[{"title": "Dashboard", "position": 0}, {"title": "Courses", "position": 1}]'::jsonb, 1
FROM workspace_types wt WHERE wt.code = 'study'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'certifications', 'Certifications', '[]'::jsonb, 2
FROM workspace_types wt WHERE wt.code = 'study'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'research', 'Research', '[]'::jsonb, 3
FROM workspace_types wt WHERE wt.code = 'study'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

-- 5) Subtipos bajo WORK (programmer, remote_worker ya pueden existir)
INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'job', 'Job', '[{"title": "Daily Log", "position": 0}, {"title": "Tasks", "position": 1}]'::jsonb, 2
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'freelance', 'Freelance', '[{"title": "Projects", "position": 0}, {"title": "Time tracking", "position": 1}]'::jsonb, 3
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'business', 'Business', '[]'::jsonb, 4
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'projects', 'Projects', '[]'::jsonb, 5
FROM workspace_types wt WHERE wt.code = 'work'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

-- 6) Subtipos bajo GENERAL
INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'personal', 'Personal', '[]'::jsonb, 0
FROM workspace_types wt WHERE wt.code = 'general'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'planning', 'Planning', '[]'::jsonb, 1
FROM workspace_types wt WHERE wt.code = 'general'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT wt.id, 'life_admin', 'Life Admin', '[]'::jsonb, 2
FROM workspace_types wt WHERE wt.code = 'general'
ON CONFLICT (workspace_type_id, code) DO NOTHING;

-- 7) Ampliar CHECK de workspaces para incluir nuevos tipos
ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_workspace_type_check;
ALTER TABLE workspaces
  ADD CONSTRAINT workspaces_workspace_type_check
  CHECK (workspace_type IN (
    'skincare', 'study', 'work', 'fitness', 'general',
    'nutrition', 'sleep', 'mental_health'
  ));
