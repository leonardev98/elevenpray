-- ElevenPray - Migración 020: Malla curricular del alumno

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'curriculum_course_status') THEN
    CREATE TYPE curriculum_course_status AS ENUM ('pending', 'in_progress', 'approved', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS curriculum_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  credits NUMERIC(5, 2) NOT NULL DEFAULT 0,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  status curriculum_course_status NOT NULL DEFAULT 'pending',
  color_token university_course_color_token NOT NULL DEFAULT 'violet',
  notes TEXT,
  approved_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT curriculum_courses_cycle_check CHECK (cycle_number >= 1 AND cycle_number <= 20),
  CONSTRAINT curriculum_courses_credits_check CHECK (credits >= 0)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_courses_user_cycle
  ON curriculum_courses (user_id, cycle_number, sort_order);

CREATE INDEX IF NOT EXISTS idx_curriculum_courses_user_status
  ON curriculum_courses (user_id, status);

CREATE INDEX IF NOT EXISTS idx_curriculum_courses_workspace
  ON curriculum_courses (workspace_id)
  WHERE workspace_id IS NOT NULL;

DROP TRIGGER IF EXISTS tr_curriculum_courses_updated_at ON curriculum_courses;
CREATE TRIGGER tr_curriculum_courses_updated_at
  BEFORE UPDATE ON curriculum_courses
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS curriculum_prerequisites (
  curriculum_course_id UUID NOT NULL REFERENCES curriculum_courses (id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES curriculum_courses (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (curriculum_course_id, prerequisite_course_id),
  CONSTRAINT curriculum_prerequisites_no_self CHECK (curriculum_course_id <> prerequisite_course_id)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_prerequisites_prereq
  ON curriculum_prerequisites (prerequisite_course_id);

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS curriculum_course_id UUID REFERENCES curriculum_courses (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_curriculum_course_id
  ON courses (curriculum_course_id)
  WHERE curriculum_course_id IS NOT NULL;
