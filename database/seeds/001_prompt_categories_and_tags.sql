-- Seeds: categorías y tags globales para el módulo Prompts.
-- Ejecutar después de 006_developer_prompts_schema.sql.

INSERT INTO prompt_categories (id, code, name) VALUES
  (uuid_generate_v4(), 'debugging', 'Debugging'),
  (uuid_generate_v4(), 'refactor', 'Refactor'),
  (uuid_generate_v4(), 'testing', 'Testing'),
  (uuid_generate_v4(), 'architecture', 'Architecture'),
  (uuid_generate_v4(), 'sql', 'SQL'),
  (uuid_generate_v4(), 'documentation', 'Documentation'),
  (uuid_generate_v4(), 'code_review', 'Code Review'),
  (uuid_generate_v4(), 'ui', 'UI Generation'),
  (uuid_generate_v4(), 'devops', 'DevOps'),
  (uuid_generate_v4(), 'api_design', 'API Design')
ON CONFLICT (code) DO NOTHING;

INSERT INTO prompt_tags (id, name) VALUES
  (uuid_generate_v4(), 'react'),
  (uuid_generate_v4(), 'nextjs'),
  (uuid_generate_v4(), 'nestjs'),
  (uuid_generate_v4(), 'node'),
  (uuid_generate_v4(), 'mysql'),
  (uuid_generate_v4(), 'aws'),
  (uuid_generate_v4(), 'prompt-largo'),
  (uuid_generate_v4(), 'diario'),
  (uuid_generate_v4(), 'importante'),
  (uuid_generate_v4(), 'reusable')
ON CONFLICT (name) DO NOTHING;
