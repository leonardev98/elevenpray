-- Añade la columna active_routine_workspace_id a user_ui_state si no existe.
-- (Rutina activa en el dashboard: solo una workspace puede estar “activa” a la vez.)
ALTER TABLE user_ui_state
  ADD COLUMN IF NOT EXISTS active_routine_workspace_id UUID REFERENCES workspaces (id) ON DELETE SET NULL;

COMMENT ON COLUMN user_ui_state.active_routine_workspace_id IS 'Workspace cuya rutina se muestra en el dashboard semanal; NULL = mostrar todas.';
