-- ElevenPray - Migración 023: biblioteca de plantillas académicas (comunidad)
-- Idempotente.

CREATE TABLE IF NOT EXISTS community_academic_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  career TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  university TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_size_bytes BIGINT,
  attachment_mime TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  save_count INTEGER NOT NULL DEFAULT 0,
  authorship_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  CONSTRAINT community_academic_templates_type_check
    CHECK (type IN ('apunte', 'mapa_mental', 'esquema', 'planificador', 'tabla')),
  CONSTRAINT community_academic_templates_status_check
    CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT community_academic_templates_career_check
    CHECK (career IN (
      'medicina', 'ingenieria', 'derecho', 'administracion',
      'psicologia', 'sistemas', 'arquitectura', 'otras'
    ))
);

CREATE INDEX IF NOT EXISTS idx_community_academic_templates_status_career
  ON community_academic_templates (status, career);
CREATE INDEX IF NOT EXISTS idx_community_academic_templates_status_created
  ON community_academic_templates (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_academic_templates_user_status
  ON community_academic_templates (user_id, status);
CREATE INDEX IF NOT EXISTS idx_community_academic_templates_university
  ON community_academic_templates (university);

DROP TRIGGER IF EXISTS tr_community_academic_templates_updated_at ON community_academic_templates;
CREATE TRIGGER tr_community_academic_templates_updated_at
  BEFORE UPDATE ON community_academic_templates
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS community_template_saves (
  template_id UUID NOT NULL REFERENCES community_academic_templates (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (template_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_template_saves_user
  ON community_template_saves (user_id);

CREATE TABLE IF NOT EXISTS user_xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_xp_events_template_approval
  ON user_xp_events (user_id, source, reference_id)
  WHERE source = 'community_template_approved' AND reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_xp_events_user_created
  ON user_xp_events (user_id, created_at DESC);

-- Seed: 6 plantillas aprobadas (solo si hay al menos un usuario)
DO $$
DECLARE
  seed_user_id UUID;
BEGIN
  SELECT id INTO seed_user_id FROM users ORDER BY created_at ASC LIMIT 1;
  IF seed_user_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM community_academic_templates LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO community_academic_templates (
    user_id, type, title, career, subject, description, university,
    attachment_url, attachment_name, attachment_size_bytes, attachment_mime,
    status, is_featured, download_count, save_count, authorship_confirmed,
    created_at, approved_at
  ) VALUES
  (
    seed_user_id, 'mapa_mental',
    'Sistema locomotor — mapa integrado',
    'medicina', 'Anatomía',
    'Mapa mental con huesos, articulaciones y grupos musculares para parcial de Anatomía I.',
    'UPC',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'sistema-locomotor-mapa.pdf', 13264, 'application/pdf',
    'approved', true, 234, 41, true,
    now() - interval '3 days', now() - interval '2 days'
  ),
  (
    seed_user_id, 'apunte',
    'Potencial de membrana y sinapsis',
    'medicina', 'Fisiología',
    'Apuntes de clase con diagramas de potencial de acción y neurotransmisión.',
    'UNMSM',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'potencial-membrana-apunte.pdf', 13264, 'application/pdf',
    'approved', false, 187, 29, true,
    now() - interval '5 days', now() - interval '4 days'
  ),
  (
    seed_user_id, 'tabla',
    'Tabla de derivadas e integrales frecuentes',
    'ingenieria', 'Cálculo',
    'Referencia rápida para exámenes parciales de Cálculo I y II.',
    'UNI',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'tabla-derivadas-calculo.pdf', 13264, 'application/pdf',
    'approved', true, 312, 58, true,
    now() - interval '7 days', now() - interval '6 days'
  ),
  (
    seed_user_id, 'esquema',
    'Cinemática — fórmulas y casos típicos',
    'ingenieria', 'Física',
    'Esquema con MRU, MRUV y movimiento circular para resolver ejercicios tipo examen.',
    'PUCP',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'cinematica-esquema.pdf', 13264, 'application/pdf',
    'approved', false, 156, 22, true,
    now() - interval '10 days', now() - interval '9 days'
  ),
  (
    seed_user_id, 'apunte',
    'Obligaciones y contratos — resumen Civil I',
    'derecho', 'Derecho Civil',
    'Síntesis de fuentes de obligaciones, nulidad y elementos del contrato.',
    'UPC',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'derecho-civil-resumen.pdf', 13264, 'application/pdf',
    'approved', false, 89, 15, true,
    now() - interval '12 days', now() - interval '11 days'
  ),
  (
    seed_user_id, 'planificador',
    'Planificador de estudio — Estructuras de datos',
    'sistemas', 'Estructuras de datos',
    'Cronograma semanal con repaso de listas, árboles y grafos antes del final.',
    'UNSA',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    'planificador-estructuras-datos.pdf', 13264, 'application/pdf',
    'approved', false, 45, 12, true,
    now() - interval '2 days', now() - interval '1 day'
  );
END $$;
