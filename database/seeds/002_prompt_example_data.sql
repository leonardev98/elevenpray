-- Seeds: carpetas, proyectos y prompts de ejemplo para el primer usuario.
-- Ejecutar después de 001_prompt_categories_and_tags.sql y con al menos un usuario en la tabla users.

DO $$
DECLARE
  uid UUID;
  fid1 UUID;
  fid2 UUID;
  fid3 UUID;
  pid1 UUID;
  pid2 UUID;
  pcat_debug UUID;
  pcat_refactor UUID;
  pcat_testing UUID;
  pcat_api UUID;
  tag_react UUID;
  tag_node UUID;
  tag_rest UUID;
  p1 UUID;
  p2 UUID;
  p3 UUID;
  p4 UUID;
  p5 UUID;
BEGIN
  SELECT id INTO uid FROM users LIMIT 1;
  IF uid IS NULL THEN
    RAISE NOTICE 'No user found. Skip example prompts seed.';
    RETURN;
  END IF;

  INSERT INTO prompt_folders (id, user_id, name, sort_order) VALUES
    (uuid_generate_v4(), uid, 'Trabajo', 0),
    (uuid_generate_v4(), uid, 'Día a día', 1),
    (uuid_generate_v4(), uid, 'Backend', 2);
  SELECT id INTO fid1 FROM prompt_folders WHERE user_id = uid AND name = 'Trabajo' LIMIT 1;
  SELECT id INTO fid2 FROM prompt_folders WHERE user_id = uid AND name = 'Día a día' LIMIT 1;
  SELECT id INTO fid3 FROM prompt_folders WHERE user_id = uid AND name = 'Backend' LIMIT 1;

  INSERT INTO developer_projects (id, user_id, name, repository_name, sort_order) VALUES
    (uuid_generate_v4(), uid, 'Skincare Workspace', NULL, 0),
    (uuid_generate_v4(), uid, 'Repo OnRoad', 'backend-auth-service', 1);
  SELECT id INTO pid1 FROM developer_projects WHERE user_id = uid AND name = 'Skincare Workspace' LIMIT 1;
  SELECT id INTO pid2 FROM developer_projects WHERE user_id = uid AND name = 'Repo OnRoad' LIMIT 1;

  SELECT id INTO pcat_debug FROM prompt_categories WHERE code = 'debugging' LIMIT 1;
  SELECT id INTO pcat_refactor FROM prompt_categories WHERE code = 'refactor' LIMIT 1;
  SELECT id INTO pcat_testing FROM prompt_categories WHERE code = 'testing' LIMIT 1;
  SELECT id INTO pcat_api FROM prompt_categories WHERE code = 'api_design' LIMIT 1;
  SELECT id INTO tag_react FROM prompt_tags WHERE name = 'react' LIMIT 1;
  SELECT id INTO tag_node FROM prompt_tags WHERE name = 'node' LIMIT 1;
  SELECT id INTO tag_rest FROM prompt_tags WHERE name = 'reusable' LIMIT 1;

  INSERT INTO prompts (id, user_id, folder_id, category_id, project_id, title, slug, description, content, prompt_type, status, is_favorite, is_pinned, created_by, updated_by) VALUES
    (uuid_generate_v4(), uid, fid1, pcat_debug, NULL, 'Debug React re-renders', 'debug-react-rerenders', 'Find unnecessary re-renders and suggest memo/useCallback', 'Analyze this React component and list all causes of unnecessary re-renders. For each, suggest a fix (React.memo, useCallback, useMemo, or moving state).', 'debugging', 'active', true, false, uid, uid),
    (uuid_generate_v4(), uid, fid1, pcat_refactor, NULL, 'Refactor to hooks', 'refactor-to-hooks', 'Convert class component to function + hooks', 'Convert this class component to a function component using React hooks. Preserve all behavior and side effects.', 'refactor', 'active', false, false, uid, uid),
    (uuid_generate_v4(), uid, fid2, pcat_testing, pid1, 'Write unit tests', 'write-unit-tests', 'Generate Jest/Vitest tests for the given code', 'Write unit tests for this module. Use Jest (or Vitest). Cover happy path and main edge cases. Mock external dependencies.', 'testing', 'active', true, false, uid, uid),
    (uuid_generate_v4(), uid, fid3, pcat_api, pid2, 'API design review', 'api-design-review', 'Review REST/API design and suggest improvements', 'Review this API design (endpoints, status codes, payloads). Suggest improvements for consistency, versioning, and error handling.', 'api_design', 'active', false, false, uid, uid),
    (uuid_generate_v4(), uid, fid2, pcat_debug, NULL, 'Explain this error', 'explain-error', 'Get a clear explanation and fix suggestions', 'Explain this error in simple terms and suggest concrete steps to fix it. Include code snippets if relevant.', 'debugging', 'active', true, true, uid, uid);

  SELECT id INTO p1 FROM prompts WHERE user_id = uid AND slug = 'debug-react-rerenders' LIMIT 1;
  SELECT id INTO p2 FROM prompts WHERE user_id = uid AND slug = 'refactor-to-hooks' LIMIT 1;
  SELECT id INTO p3 FROM prompts WHERE user_id = uid AND slug = 'write-unit-tests' LIMIT 1;
  SELECT id INTO p4 FROM prompts WHERE user_id = uid AND slug = 'api-design-review' LIMIT 1;
  SELECT id INTO p5 FROM prompts WHERE user_id = uid AND slug = 'explain-error' LIMIT 1;

  IF tag_react IS NOT NULL AND p1 IS NOT NULL THEN
    INSERT INTO prompt_tag_relations (prompt_id, tag_id) VALUES (p1, tag_react) ON CONFLICT DO NOTHING;
  END IF;
  IF tag_react IS NOT NULL AND p2 IS NOT NULL THEN
    INSERT INTO prompt_tag_relations (prompt_id, tag_id) VALUES (p2, tag_react) ON CONFLICT DO NOTHING;
  END IF;
  IF tag_node IS NOT NULL AND p4 IS NOT NULL THEN
    INSERT INTO prompt_tag_relations (prompt_id, tag_id) VALUES (p4, tag_node) ON CONFLICT DO NOTHING;
  END IF;
  IF tag_rest IS NOT NULL THEN
    INSERT INTO prompt_tag_relations (prompt_id, tag_id)
    SELECT pr.id, tag_rest FROM prompts pr WHERE pr.user_id = uid AND pr.slug IN ('debug-react-rerenders', 'explain-error')
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Example prompts seed done for user %', uid;
END $$;
