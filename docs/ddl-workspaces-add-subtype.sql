-- ElevenPray - Añadir workspace_subtype_id a workspaces
-- Ejecutar después de ddl-workspace-types.sql (tabla workspace_subtypes existente).

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS workspace_subtype_id UUID REFERENCES workspace_subtypes (id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_workspace_subtype_id ON workspaces (workspace_subtype_id);
