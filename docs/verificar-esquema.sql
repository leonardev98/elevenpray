-- =============================================================================
-- Verificación del esquema (última integración: rutina activa + dominios)
-- Ejecuta en tu BD y revisa el resultado. Si algo falla, aplica el remedio debajo.
-- =============================================================================

-- 1) ¿Existe la columna active_routine_workspace_id en user_ui_state?
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_ui_state'
    AND column_name = 'active_routine_workspace_id'
) AS "user_ui_state tiene active_routine_workspace_id";
-- Si sale false: falta la columna. Aplica el ALTER de más abajo.

-- 2) ¿Existe la tabla workspace_type_domains?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'workspace_type_domains'
) AS "existe tabla workspace_type_domains";

-- 3) ¿workspace_types tiene domain_id?
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'workspace_types'
    AND column_name = 'domain_id'
) AS "workspace_types tiene domain_id";

-- 4) Resumen: todo ok si las tres salen true
SELECT
  (SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_ui_state' AND column_name = 'active_routine_workspace_id')) AS ok_active_routine,
  (SELECT EXISTS (SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'workspace_type_domains')) AS ok_domains_table,
  (SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspace_types' AND column_name = 'domain_id')) AS ok_domain_id;

-- =============================================================================
-- REMEDIO: si "user_ui_state tiene active_routine_workspace_id" salió false,
-- ejecuta esto:
-- =============================================================================
/*
ALTER TABLE user_ui_state
  ADD COLUMN IF NOT EXISTS active_routine_workspace_id UUID REFERENCES workspaces (id) ON DELETE SET NULL;

COMMENT ON COLUMN user_ui_state.active_routine_workspace_id IS 'Workspace cuya rutina se muestra en el dashboard semanal; NULL = mostrar todas.';
*/
