-- ElevenPray - Migración 004: routines asociadas a un tópico
-- Plantilla semanal: year=0, week_number=0. Opcionalmente overrides por semana (year, week_number).
-- Estructura days (JSONB): { "monday": { "items": [{ "id": "uuid", "type": "heading"|"list"|"text", "content": "..." }] }, ... }

ALTER TABLE routines
  ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_routines_topic_id ON routines (topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_routines_topic_year_week ON routines (topic_id, year, week_number);

-- Opcional: si no hay datos legacy, descomenta para exigir topic_id en nuevas filas:
-- ALTER TABLE routines ALTER COLUMN topic_id SET NOT NULL;
