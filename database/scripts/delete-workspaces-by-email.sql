-- Borra TODOS los workspaces del usuario con este email.
-- Las tablas que referencian workspaces (spaces, pages, routine_templates, etc.)
-- suelen tener ON DELETE CASCADE, así que se borrarán en cascada.
-- Ejecutar con cuidado (reemplaza el email si es otro).

DELETE FROM workspaces
WHERE user_id = (SELECT id FROM users WHERE email = 'leonardpostillos@gmail.com');
