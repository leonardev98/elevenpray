-- Vincular recursos de curso a una sesión de clase (archivos ingeridos por fileingest).

ALTER TABLE course_resources
  ADD COLUMN IF NOT EXISTS class_session_id UUID REFERENCES class_sessions (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_course_resources_class_session
  ON course_resources (class_session_id)
  WHERE class_session_id IS NOT NULL;
