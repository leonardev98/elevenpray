-- =============================================================================
-- Verificar si un usuario tiene perfil de piel guardado (por email)
-- =============================================================================
-- Sustituye 'leonardpostillos@gmail.com' por el email que uses para entrar.
-- Ejecuta en el SQL Editor de Supabase (o tu cliente SQL).
-- =============================================================================

-- 1) Tu usuario y workspaces
SELECT
  u.id AS user_id,
  u.email,
  u.name,
  w.id AS workspace_id,
  w.name AS workspace_name,
  w.workspace_type
FROM users u
LEFT JOIN workspaces w ON w.user_id = u.id
WHERE u.email = 'leonardpostillos@gmail.com';

-- 2) Preferencias de workspace (perfil de piel / onboarding) para ese usuario
SELECT
  u.email,
  w.name AS workspace_name,
  p.id AS preference_id,
  p.onboarding_completed_at,
  p.onboarding_answers
  -- p.skincare_profile solo si ya ejecutaste la migración que añade esa columna
FROM users u
JOIN user_workspace_preferences p ON p.user_id = u.id
JOIN workspaces w ON w.id = p.workspace_id
WHERE u.email = 'leonardpostillos@gmail.com';

-- Si la segunda query NO devuelve filas = no hay preferencia guardada.
--   Causas posibles: "Error al actualizar preferencias" (p. ej. falta columna skincare_profile).
--   Solución: ejecuta esto y vuelve a guardar el perfil en la app:
--   ALTER TABLE user_workspace_preferences ADD COLUMN IF NOT EXISTS skincare_profile JSONB;
--
-- Si la segunda query SÍ devuelve filas y onboarding_answers tiene datos (skinType, etc.)
--   = el perfil está guardado; la app no debería volver a preguntar.
--   Si aun así pregunta, comprueba que entras al mismo workspace (mismo workspace_id en la URL).
