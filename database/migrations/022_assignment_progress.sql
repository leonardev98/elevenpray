-- Progress percentage for student assignments (0-100)
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS progress_percent SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE assignments
  DROP CONSTRAINT IF EXISTS assignments_progress_percent_check;

ALTER TABLE assignments
  ADD CONSTRAINT assignments_progress_percent_check
  CHECK (progress_percent >= 0 AND progress_percent <= 100);
