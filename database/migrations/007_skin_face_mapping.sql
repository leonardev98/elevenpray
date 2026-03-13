-- ElevenPray - Migración 007: Skin Face Mapping (sesiones y marcadores faciales para workspace skincare)
-- Requiere: workspaces (001/002 y tablas base). Ejecutar después de migraciones previas.

-- Sesiones de evaluación facial (agrupa marcadores por fecha/modelo)
CREATE TABLE IF NOT EXISTS skin_face_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  face_model_type TEXT NOT NULL CHECK (face_model_type IN ('female', 'male')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skin_face_sessions_workspace_id ON skin_face_sessions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_skin_face_sessions_session_date ON skin_face_sessions (session_date);

DROP TRIGGER IF EXISTS tr_skin_face_sessions_updated_at ON skin_face_sessions;
CREATE TRIGGER tr_skin_face_sessions_updated_at
  BEFORE UPDATE ON skin_face_sessions
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Marcadores sobre el rostro 3D (punto x,y,z + tipo de problema, severidad, notas, foto opcional)
CREATE TABLE IF NOT EXISTS skin_face_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  session_id UUID REFERENCES skin_face_sessions (id) ON DELETE SET NULL,
  face_model_type TEXT NOT NULL CHECK (face_model_type IN ('female', 'male')),
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL,
  z DOUBLE PRECISION NOT NULL,
  region_label TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skin_face_markers_workspace_id ON skin_face_markers (workspace_id);
CREATE INDEX IF NOT EXISTS idx_skin_face_markers_session_id ON skin_face_markers (session_id);
CREATE INDEX IF NOT EXISTS idx_skin_face_markers_face_model_type ON skin_face_markers (face_model_type);
CREATE INDEX IF NOT EXISTS idx_skin_face_markers_created_at ON skin_face_markers (created_at);

DROP TRIGGER IF EXISTS tr_skin_face_markers_updated_at ON skin_face_markers;
CREATE TRIGGER tr_skin_face_markers_updated_at
  BEFORE UPDATE ON skin_face_markers
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
