-- ElevenPray - Migración 015: Flashcards y Quizzes por clase
-- Añade enlaces directos curso/clase a flashcards, crea modelo de quizzes (mixto)
-- y de apuntes persistentes para preparar el reemplazo del localStorage.
-- Idempotente.

-- 1) class_sessions: numeración estable y unidad temática
ALTER TABLE class_sessions
  ADD COLUMN IF NOT EXISTS class_number INTEGER,
  ADD COLUMN IF NOT EXISTS unit_label TEXT;

CREATE INDEX IF NOT EXISTS idx_class_sessions_course_number
  ON class_sessions (course_id, class_number);

-- 2) flashcards: enlace directo a curso, clase y workspace + deck opcional
ALTER TABLE flashcards
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces (id) ON DELETE CASCADE;

ALTER TABLE flashcards ALTER COLUMN deck_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_flashcards_course ON flashcards (course_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_class_session ON flashcards (class_session_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_workspace ON flashcards (workspace_id);

-- 3) Apuntes de curso (notas independientes que hoy viven en localStorage)
CREATE TABLE IF NOT EXISTS course_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_json JSONB,
  preview TEXT,
  color_accent TEXT,
  icon TEXT NOT NULL DEFAULT 'book',
  read_minutes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_notes_course ON course_notes (course_id);
CREATE INDEX IF NOT EXISTS idx_course_notes_workspace ON course_notes (workspace_id);
CREATE INDEX IF NOT EXISTS idx_course_notes_class_session ON course_notes (class_session_id);
DROP TRIGGER IF EXISTS tr_course_notes_updated_at ON course_notes;
CREATE TRIGGER tr_course_notes_updated_at BEFORE UPDATE ON course_notes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 4) Quizzes: enum para tipo de pregunta
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_question_type') THEN
    CREATE TYPE quiz_question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
  END IF;
END $$;

-- 5) Tabla principal de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quizzes_difficulty_check CHECK (difficulty BETWEEN 1 AND 5)
);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes (course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_class_session ON quizzes (class_session_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_workspace ON quizzes (workspace_id);
DROP TRIGGER IF EXISTS tr_quizzes_updated_at ON quizzes;
CREATE TRIGGER tr_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 6) Preguntas de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
  type quiz_question_type NOT NULL DEFAULT 'multiple_choice',
  prompt TEXT NOT NULL,
  explanation TEXT,
  expected_answer TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id, position);

-- 7) Opciones de pregunta (multiple_choice / true_false)
CREATE TABLE IF NOT EXISTS quiz_question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_question_options (question_id, position);

-- 8) Intentos de quiz (historial)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL DEFAULT 'quiz',
  source_quiz_ids JSONB,
  class_session_ids JSONB,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  duration_seconds INTEGER,
  answers JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT quiz_attempts_source_kind_check CHECK (source_kind IN ('quiz', 'combined'))
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course ON quiz_attempts (course_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_workspace ON quiz_attempts (workspace_id);
