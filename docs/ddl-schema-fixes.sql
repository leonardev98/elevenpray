-- ElevenPray - Correcciones al schema existente
-- Ejecutar sobre la BD que ya tiene todas las tablas creadas.
-- Idempotente: no falla si las restricciones o FKs ya existen.

-- ---------------------------------------------------------------------------
-- 1. user_workspace_preferences: un solo registro por (user_id, workspace_id)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_workspace_preferences_user_id_workspace_id_key'
  ) THEN
    ALTER TABLE public.user_workspace_preferences
      ADD CONSTRAINT user_workspace_preferences_user_id_workspace_id_key UNIQUE (user_id, workspace_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. workspace_subtypes: códigos únicos por tipo (ej. un solo "programmer" por work)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspace_subtypes_workspace_type_id_code_key'
  ) THEN
    ALTER TABLE public.workspace_subtypes
      ADD CONSTRAINT workspace_subtypes_workspace_type_id_code_key UNIQUE (workspace_type_id, code);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. (Opcional) ON DELETE SET NULL en workspaces.workspace_subtype_id
--    Si se borra un subtipo, el workspace queda sin subtipo en vez de fallar.
-- ---------------------------------------------------------------------------
ALTER TABLE public.workspaces
  DROP CONSTRAINT IF EXISTS workspaces_workspace_subtype_id_fkey;
ALTER TABLE public.workspaces
  ADD CONSTRAINT workspaces_workspace_subtype_id_fkey
  FOREIGN KEY (workspace_subtype_id) REFERENCES public.workspace_subtypes(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 4. (Opcional) ON DELETE SET NULL en user_ui_state.current_workspace_id
--    Si se borra un workspace, el estado UI deja de apuntar a él.
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_ui_state
  DROP CONSTRAINT IF EXISTS user_ui_state_current_workspace_id_fkey;
ALTER TABLE public.user_ui_state
  ADD CONSTRAINT user_ui_state_current_workspace_id_fkey
  FOREIGN KEY (current_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL;
