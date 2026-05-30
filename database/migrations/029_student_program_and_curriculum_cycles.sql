-- Tipo de programa (técnico / universidad) y total de ciclos base de malla
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS student_program_type TEXT
    CHECK (student_program_type IN ('tecnico', 'universidad'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS curriculum_total_cycles SMALLINT
    CHECK (curriculum_total_cycles IS NULL OR (curriculum_total_cycles >= 1 AND curriculum_total_cycles <= 20));
