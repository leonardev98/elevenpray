-- ElevenPray - Migración 011: Study workspace + University subtype + Student OS schema
-- Crea el tipo padre `study`, migra datos legacy de `university`, y añade modelo académico.

-- 1) Workspace type padre `study` y migración legacy desde `university`
-- Orden: insertar tipo 'study', quitar CHECK, migrar filas de 'university' -> 'study', volver a poner CHECK, limpiar 'university'.
INSERT INTO workspace_types (code, label, capabilities, sort_order)
VALUES ('study', 'Study', '{"hasRoutine": false, "hasDashboardWidgets": true}', 1)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  capabilities = EXCLUDED.capabilities,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

ALTER TABLE workspaces DROP CONSTRAINT IF EXISTS workspaces_workspace_type_check;

UPDATE workspaces
SET workspace_type = 'study'
WHERE workspace_type = 'university';

ALTER TABLE workspaces
  ADD CONSTRAINT workspaces_workspace_type_check
  CHECK (workspace_type IN ('skincare', 'study', 'work', 'fitness', 'general'));

DELETE FROM workspace_subtypes
WHERE workspace_type_id = (SELECT id FROM workspace_types WHERE code = 'university');

DELETE FROM workspace_types
WHERE code = 'university';

INSERT INTO workspace_subtypes (workspace_type_id, code, label, default_pages, sort_order)
SELECT
  wt.id,
  'university',
  'University',
  '[
    {"title": "Dashboard", "position": 0},
    {"title": "Courses", "position": 1},
    {"title": "Calendar", "position": 2},
    {"title": "Tasks", "position": 3},
    {"title": "Sessions", "position": 4}
  ]'::jsonb,
  0
FROM workspace_types wt
WHERE wt.code = 'study'
ON CONFLICT (workspace_type_id, code) DO UPDATE SET
  label = EXCLUDED.label,
  default_pages = EXCLUDED.default_pages,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 2) Catálogos y checks del dominio universitario
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_grade_scale') THEN
    CREATE TYPE university_grade_scale AS ENUM ('0_20', '0_100', 'A_F');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_course_kind') THEN
    CREATE TYPE university_course_kind AS ENUM ('lecture', 'lab', 'seminar', 'workshop', 'other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_course_color_token') THEN
    CREATE TYPE university_course_color_token AS ENUM ('blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'teal');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_weekday') THEN
    CREATE TYPE university_weekday AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_assignment_priority') THEN
    CREATE TYPE university_assignment_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_assignment_status') THEN
    CREATE TYPE university_assignment_status AS ENUM ('pending', 'in_progress', 'submitted', 'done', 'late');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_attendance_status') THEN
    CREATE TYPE university_attendance_status AS ENUM ('present', 'late', 'absent', 'justified');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'university_grade_item_type') THEN
    CREATE TYPE university_grade_item_type AS ENUM ('exam', 'quiz', 'project', 'assignment', 'participation', 'other');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_focus_status') THEN
    CREATE TYPE study_focus_status AS ENUM ('in_progress', 'completed', 'cancelled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_reminder_kind') THEN
    CREATE TYPE study_reminder_kind AS ENUM ('class_session', 'assignment', 'focus', 'custom');
  END IF;
END $$;

-- 3) Configuración del workspace University
CREATE TABLE IF NOT EXISTS study_workspace_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  subtype_code TEXT NOT NULL DEFAULT 'university',
  current_semester_label TEXT,
  start_date DATE,
  end_date DATE,
  grade_scale university_grade_scale NOT NULL DEFAULT '0_100',
  credit_goal NUMERIC(6,2),
  auto_generate_sessions BOOLEAN NOT NULL DEFAULT true,
  reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  conflict_detection_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT study_workspace_configs_onboarding_step_check CHECK (onboarding_step BETWEEN 1 AND 3)
);
CREATE INDEX IF NOT EXISTS idx_study_workspace_configs_workspace_id ON study_workspace_configs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_study_workspace_configs_user_id ON study_workspace_configs (user_id);
DROP TRIGGER IF EXISTS tr_study_workspace_configs_updated_at ON study_workspace_configs;
CREATE TRIGGER tr_study_workspace_configs_updated_at BEFORE UPDATE ON study_workspace_configs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  credit_goal NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT semesters_dates_check CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  )
);
CREATE INDEX IF NOT EXISTS idx_semesters_workspace_id ON semesters (workspace_id);
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON semesters (user_id);
CREATE INDEX IF NOT EXISTS idx_semesters_workspace_current ON semesters (workspace_id, is_current);
DROP TRIGGER IF EXISTS tr_semesters_updated_at ON semesters;
CREATE TRIGGER tr_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters (id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  professor TEXT,
  credits NUMERIC(6,2),
  classroom TEXT,
  course_type university_course_kind NOT NULL DEFAULT 'lecture',
  color_token university_course_color_token NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_courses_workspace_id ON courses (workspace_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON courses (semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses (user_id);
CREATE INDEX IF NOT EXISTS idx_courses_workspace_sort ON courses (workspace_id, sort_order, created_at);
DROP TRIGGER IF EXISTS tr_courses_updated_at ON courses;
CREATE TRIGGER tr_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS course_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  weekday university_weekday NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  classroom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT course_schedules_time_range_check CHECK (start_time < end_time)
);
CREATE INDEX IF NOT EXISTS idx_course_schedules_course_id ON course_schedules (course_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_workspace_weekday ON course_schedules (workspace_id, weekday);
DROP TRIGGER IF EXISTS tr_course_schedules_updated_at ON course_schedules;
CREATE TRIGGER tr_course_schedules_updated_at BEFORE UPDATE ON course_schedules FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters (id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES course_schedules (id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  classroom TEXT,
  title TEXT,
  notes_html TEXT,
  notes_json JSONB,
  ai_summary_mock TEXT,
  generated_from_schedule BOOLEAN NOT NULL DEFAULT false,
  opened_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT class_sessions_time_range_check CHECK (start_time < end_time)
);
CREATE INDEX IF NOT EXISTS idx_class_sessions_workspace_id ON class_sessions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_id ON class_sessions (course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_semester_id ON class_sessions (semester_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_workspace_date ON class_sessions (workspace_id, session_date);
CREATE INDEX IF NOT EXISTS idx_class_sessions_workspace_date_time ON class_sessions (workspace_id, session_date, start_time, end_time);
DROP TRIGGER IF EXISTS tr_class_sessions_updated_at ON class_sessions;
CREATE TRIGGER tr_class_sessions_updated_at BEFORE UPDATE ON class_sessions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters (id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  priority university_assignment_priority NOT NULL DEFAULT 'medium',
  status university_assignment_status NOT NULL DEFAULT 'pending',
  attachments JSONB,
  source_kind TEXT NOT NULL DEFAULT 'assignment',
  external_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assignments_workspace_id ON assignments (workspace_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments (course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_session_id ON assignments (class_session_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments (workspace_id, deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (workspace_id, status);
DROP TRIGGER IF EXISTS tr_assignments_updated_at ON assignments;
CREATE TRIGGER tr_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  class_session_id UUID NOT NULL UNIQUE REFERENCES class_sessions (id) ON DELETE CASCADE,
  status university_attendance_status NOT NULL DEFAULT 'present',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attendance_records_workspace_id ON attendance_records (workspace_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_course_id ON attendance_records (course_id);
DROP TRIGGER IF EXISTS tr_attendance_records_updated_at ON attendance_records;
CREATE TRIGGER tr_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS grade_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type university_grade_item_type NOT NULL DEFAULT 'other',
  weight NUMERIC(6,2) NOT NULL DEFAULT 0,
  score NUMERIC(10,4),
  max_score NUMERIC(10,4),
  grade_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT grade_items_weight_check CHECK (weight >= 0 AND weight <= 100),
  CONSTRAINT grade_items_score_check CHECK (score IS NULL OR score >= 0),
  CONSTRAINT grade_items_max_score_check CHECK (max_score IS NULL OR max_score > 0),
  CONSTRAINT grade_items_score_max_check CHECK (
    score IS NULL OR max_score IS NULL OR score <= max_score
  )
);
CREATE INDEX IF NOT EXISTS idx_grade_items_workspace_id ON grade_items (workspace_id);
CREATE INDEX IF NOT EXISTS idx_grade_items_course_id ON grade_items (course_id);
CREATE INDEX IF NOT EXISTS idx_grade_items_grade_date ON grade_items (course_id, grade_date);
DROP TRIGGER IF EXISTS tr_grade_items_updated_at ON grade_items;
CREATE TRIGGER tr_grade_items_updated_at BEFORE UPDATE ON grade_items FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'file',
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_resources_workspace_id ON course_resources (workspace_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources (course_id);
DROP TRIGGER IF EXISTS tr_course_resources_updated_at ON course_resources;
CREATE TRIGGER tr_course_resources_updated_at BEFORE UPDATE ON course_resources FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses (id) ON DELETE SET NULL,
  class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_workspace_id ON flashcard_decks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_course_id ON flashcard_decks (course_id);
DROP TRIGGER IF EXISTS tr_flashcard_decks_updated_at ON flashcard_decks;
CREATE TRIGGER tr_flashcard_decks_updated_at BEFORE UPDATE ON flashcard_decks FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES flashcard_decks (id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  ease_factor NUMERIC(5,2),
  due_at TIMESTAMPTZ,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards (deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_due_at ON flashcards (due_at);
DROP TRIGGER IF EXISTS tr_flashcards_updated_at ON flashcards;
CREATE TRIGGER tr_flashcards_updated_at BEFORE UPDATE ON flashcards FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS study_focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses (id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  status study_focus_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT study_focus_sessions_duration_check CHECK (duration_minutes > 0)
);
CREATE INDEX IF NOT EXISTS idx_study_focus_sessions_workspace_id ON study_focus_sessions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_study_focus_sessions_course_id ON study_focus_sessions (course_id);
CREATE INDEX IF NOT EXISTS idx_study_focus_sessions_started_at ON study_focus_sessions (workspace_id, started_at DESC);
DROP TRIGGER IF EXISTS tr_study_focus_sessions_updated_at ON study_focus_sessions;
CREATE TRIGGER tr_study_focus_sessions_updated_at BEFORE UPDATE ON study_focus_sessions FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind study_reminder_kind NOT NULL DEFAULT 'custom',
  target_id UUID,
  remind_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  source_kind TEXT,
  external_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reminders_workspace_id ON reminders (workspace_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders (user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders (workspace_id, remind_at);
DROP TRIGGER IF EXISTS tr_reminders_updated_at ON reminders;
CREATE TRIGGER tr_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
