-- Escala de notas del perfil estudiantil (alineada con university_grade_scale)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_grade_scale') THEN
    CREATE TYPE university_grade_scale AS ENUM ('0_20', '0_100', 'A_F');
  END IF;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS student_grade_scale university_grade_scale NOT NULL DEFAULT '0_20';
