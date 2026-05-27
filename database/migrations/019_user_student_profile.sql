-- ElevenPray - Migración 019: perfil estudiantil en users (onboarding Mitsyy)

ALTER TABLE users ADD COLUMN IF NOT EXISTS student_university TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_career TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_academic_cycle TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_onboarding_completed_at TIMESTAMPTZ;
