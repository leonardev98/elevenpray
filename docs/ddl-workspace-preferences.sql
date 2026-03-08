-- ElevenPray - user_workspace_preferences y user_ui_state
-- Ejecutar después del esquema workspaces.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. user_workspace_preferences
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_workspace_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  favorite BOOLEAN NOT NULL DEFAULT false,
  visible_on_dashboard BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);
CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_user_id ON user_workspace_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspace_preferences_workspace_id ON user_workspace_preferences (workspace_id);

-- ---------------------------------------------------------------------------
-- 2. user_ui_state
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_ui_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE UNIQUE,
  current_workspace_id UUID REFERENCES workspaces (id) ON DELETE SET NULL,
  selected_workspace_ids UUID[] NOT NULL DEFAULT '{}',
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_ui_state_user_id ON user_ui_state (user_id);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_user_workspace_preferences_updated_at ON user_workspace_preferences;
CREATE TRIGGER tr_user_workspace_preferences_updated_at BEFORE UPDATE ON user_workspace_preferences FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS tr_user_ui_state_updated_at ON user_ui_state;
CREATE TRIGGER tr_user_ui_state_updated_at BEFORE UPDATE ON user_ui_state FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
