-- Ejecuta este script UNA VEZ en tu base de datos (Supabase SQL Editor o psql)
-- para que dejen de aparecer los errores:
--   column UserWorkspacePreference.skincare_profile does not exist
--   column RoutineTemplate.metadata does not exist

ALTER TABLE user_workspace_preferences
ADD COLUMN IF NOT EXISTS skincare_profile jsonb;

ALTER TABLE routine_templates
ADD COLUMN IF NOT EXISTS metadata jsonb;
