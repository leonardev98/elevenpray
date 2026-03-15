-- ElevenPray - Migración 010: discovery prompts (prompts del día y trending por idioma)
-- Requiere: uuid_generate_v4(), set_updated_at(). Ejecutar después de 002.

CREATE TABLE IF NOT EXISTS discovery_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale TEXT NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('prompts_of_the_day', 'trending')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discovery_prompts_locale_section ON discovery_prompts (locale, section);
CREATE INDEX IF NOT EXISTS idx_discovery_prompts_locale_section_sort ON discovery_prompts (locale, section, sort_order);

DROP TRIGGER IF EXISTS tr_discovery_prompts_updated_at ON discovery_prompts;
CREATE TRIGGER tr_discovery_prompts_updated_at
  BEFORE UPDATE ON discovery_prompts
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Seed: Prompts del día en español
INSERT INTO discovery_prompts (locale, section, title, content, category, sort_order) VALUES
('es', 'prompts_of_the_day', 'Explica este código', 'Explica este bloque de código en términos simples. Enfócate en: qué hace, casos límite y cómo podría mejorarse. Mantén la explicación bajo 200 palabras.', 'documentation', 0),
('es', 'prompts_of_the_day', 'Escribe tests unitarios', 'Escribe tests unitarios para el siguiente código. Usa el mismo framework de testing del proyecto. Cubre el caso feliz y al menos 2 casos límite. Prefiere nombres de test descriptivos.', 'testing', 1),
('es', 'prompts_of_the_day', 'Refactoriza para legibilidad', 'Refactoriza este código para mejorar la legibilidad sin cambiar el comportamiento. Conserva toda la lógica y casos límite. Añade comentarios breves solo donde aclaren la intención.', 'refactor', 2),
('es', 'prompts_of_the_day', 'Busca posibles bugs', 'Revisa este código en busca de posibles bugs, condiciones de carrera y problemas de seguridad. Lista cada hallazgo con: ubicación, severidad (alta/media/baja) y una corrección sugerida.', 'debugging', 3),
('es', 'prompts_of_the_day', 'Genera SQL desde descripción', 'Dadas las siguientes tablas y el requisito, escribe una única consulta SQL. Prefiere SQL estándar. Añade un comentario de una línea explicando la consulta.', 'sql', 4),
('es', 'prompts_of_the_day', 'Documenta esta función', 'Añade documentación JSDoc (o equivalente) a esta función. Incluye: propósito, parámetros, valor de retorno y un ejemplo de uso.', 'documentation', 5);

-- Seed: Prompts del día en inglés
INSERT INTO discovery_prompts (locale, section, title, content, category, sort_order) VALUES
('en', 'prompts_of_the_day', 'Explain this code', 'Explain this code block in simple terms. Focus on: what it does, edge cases, and how it could be improved. Keep the explanation under 200 words.', 'documentation', 0),
('en', 'prompts_of_the_day', 'Write unit tests', 'Write unit tests for the following code. Use the same testing framework as the project. Cover happy path and at least 2 edge cases. Prefer descriptive test names.', 'testing', 1),
('en', 'prompts_of_the_day', 'Refactor for readability', 'Refactor this code for better readability without changing behavior. Preserve all logic and edge cases. Add brief comments only where they clarify intent.', 'refactor', 2),
('en', 'prompts_of_the_day', 'Find potential bugs', 'Review this code for potential bugs, race conditions, and security issues. List each finding with: location, severity (high/medium/low), and a suggested fix.', 'debugging', 3),
('en', 'prompts_of_the_day', 'Generate SQL from description', 'Given the following table schemas and requirement, write a single SQL query. Prefer standard SQL. Add a one-line comment explaining the query.', 'sql', 4),
('en', 'prompts_of_the_day', 'Document this function', 'Add JSDoc (or equivalent) documentation to this function. Include: purpose, parameters, return value, and one usage example.', 'documentation', 5);

-- Seed: Trending en español
INSERT INTO discovery_prompts (locale, section, title, content, category, sort_order) VALUES
('es', 'trending', 'Revisión de componente React', 'Revisa este componente React. Comprueba: accesibilidad (a11y), rendimiento (re-renders innecesarios, memoización) y alineación con buenas prácticas. Sugiere cambios concretos.', 'codeReview', 0),
('es', 'trending', 'Feedback de diseño de API', 'Revisa este diseño de API (endpoints, formas de request/response). Comenta: RESTfulness, manejo de errores, paginación y versionado. Sugiere mejoras.', 'apiDesign', 1),
('es', 'trending', 'Depura mensaje de error', 'Estoy recibiendo este error: [pega el error]. Ayúdame a entender la causa, la corrección más probable y cómo prevenirlo en el futuro. Sé conciso.', 'debugging', 2),
('es', 'trending', 'Simplifica la lógica', 'Simplifica la lógica de este código sin cambiar su comportamiento. Prefiere returns tempranos y nombres de variable claros. Mantén la misma interfaz pública.', 'refactor', 3),
('es', 'trending', 'Revisión de tipos TypeScript', 'Revisa los tipos TypeScript de este código. Sugiere tipos más precisos, genéricos donde aplique y evita any. Mantén la compatibilidad con el uso actual.', 'documentation', 4);

-- Seed: Trending en inglés
INSERT INTO discovery_prompts (locale, section, title, content, category, sort_order) VALUES
('en', 'trending', 'React component review', 'Review this React component. Check: accessibility (a11y), performance (unnecessary re-renders, memoization), and alignment with React best practices. Suggest concrete changes.', 'codeReview', 0),
('en', 'trending', 'API design feedback', 'Review this API design (endpoints, request/response shapes). Comment on: RESTfulness, error handling, pagination, and versioning. Suggest improvements.', 'apiDesign', 1),
('en', 'trending', 'Debug error message', 'I''m getting this error: [paste error]. Help me understand the cause, the most likely fix, and how to prevent it in the future. Be concise.', 'debugging', 2),
('en', 'trending', 'Simplify logic', 'Simplify the logic in this code without changing its behavior. Prefer early returns and clear variable names. Keep the same public interface.', 'refactor', 3),
('en', 'trending', 'TypeScript types review', 'Review the TypeScript types in this code. Suggest more precise types, generics where applicable, and avoid any. Keep compatibility with current usage.', 'documentation', 4);
