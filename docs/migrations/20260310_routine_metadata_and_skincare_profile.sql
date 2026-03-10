ALTER TABLE routine_templates
ADD COLUMN IF NOT EXISTS metadata jsonb;

ALTER TABLE user_workspace_preferences
ADD COLUMN IF NOT EXISTS skincare_profile jsonb;
