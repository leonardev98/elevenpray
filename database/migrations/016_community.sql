-- ElevenPray - Migración 016: Comunidad (feed + preguntas + comentarios + reportes)
-- Crea las tablas para el feed social, preguntas estilo Reddit con respuestas anidadas
-- a 2 niveles, likes, votos a respuestas y reportes polimórficos.
-- Idempotente.

-- 1) community_posts: feed (apuntes, plantillas, PDFs)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  course TEXT,
  university TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_size_bytes BIGINT,
  attachment_mime TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_posts_type_check CHECK (type IN ('apunte', 'plantilla', 'pdf'))
);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_university ON community_posts (university);
CREATE INDEX IF NOT EXISTS idx_community_posts_course ON community_posts (course);
DROP TRIGGER IF EXISTS tr_community_posts_updated_at ON community_posts;
CREATE TRIGGER tr_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 2) community_post_likes
CREATE TABLE IF NOT EXISTS community_post_likes (
  post_id UUID NOT NULL REFERENCES community_posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user ON community_post_likes (user_id);

-- 3) community_post_comments: 2 niveles (raíz + 1 nivel de réplica), validado en service
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_post_comments (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post ON community_post_comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_parent ON community_post_comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_user ON community_post_comments (user_id);
DROP TRIGGER IF EXISTS tr_community_post_comments_updated_at ON community_post_comments;
CREATE TRIGGER tr_community_post_comments_updated_at BEFORE UPDATE ON community_post_comments
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 4) community_questions: estilo Reddit
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  course TEXT,
  university TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  answer_count INTEGER NOT NULL DEFAULT 0,
  accepted_answer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_questions_user ON community_questions (user_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON community_questions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_university ON community_questions (university);
CREATE INDEX IF NOT EXISTS idx_community_questions_course ON community_questions (course);
DROP TRIGGER IF EXISTS tr_community_questions_updated_at ON community_questions;
CREATE TRIGGER tr_community_questions_updated_at BEFORE UPDATE ON community_questions
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 5) community_question_answers: 2 niveles (raíz + 1 réplica)
CREATE TABLE IF NOT EXISTS community_question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES community_questions (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_question_answers (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_answers_question ON community_question_answers (question_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_answers_parent ON community_question_answers (parent_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_user ON community_question_answers (user_id);
DROP TRIGGER IF EXISTS tr_community_answers_updated_at ON community_question_answers;
CREATE TRIGGER tr_community_answers_updated_at BEFORE UPDATE ON community_question_answers
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 6) FK diferida: accepted_answer_id -> community_question_answers
-- Lo añadimos después de crear answers para evitar ciclos de creación.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_community_questions_accepted_answer'
      AND table_name = 'community_questions'
  ) THEN
    ALTER TABLE community_questions
      ADD CONSTRAINT fk_community_questions_accepted_answer
      FOREIGN KEY (accepted_answer_id)
      REFERENCES community_question_answers (id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 7) community_answer_votes
CREATE TABLE IF NOT EXISTS community_answer_votes (
  answer_id UUID NOT NULL REFERENCES community_question_answers (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (answer_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_answer_votes_user ON community_answer_votes (user_id);

-- 8) community_reports: polimórfico. target_type validado por CHECK; sin FK para flexibilidad.
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_reports_target_type_check
    CHECK (target_type IN ('post', 'question', 'answer', 'comment'))
);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_user ON community_reports (user_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports (created_at DESC);
