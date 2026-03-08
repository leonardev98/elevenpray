-- ElevenPray - Eliminar tablas dependientes de users (orden por FK)
-- Ejecutar en Supabase SQL Editor antes de aplicar ddl-workspaces-create.sql

DROP TABLE IF EXISTS topic_entries CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS topics CASCADE;

-- Opcional: vaciar usuarios para empezar de cero (descomenta si quieres reset total)
-- DELETE FROM users;
