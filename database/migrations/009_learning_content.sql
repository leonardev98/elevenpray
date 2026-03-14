-- ElevenPray - Migración 009: Contenido educativo (artículos y vídeos)
-- Tablas para contenido curado de la sección Aprender del workspace Skincare.

CREATE TABLE IF NOT EXISTS learning_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  source_name TEXT,
  tags JSONB,
  language TEXT DEFAULT 'es',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source_name TEXT,
  tags JSONB,
  language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_articles_language ON learning_articles (language);
CREATE INDEX IF NOT EXISTS idx_learning_articles_created_at ON learning_articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_articles_is_featured ON learning_articles (is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_learning_videos_language ON learning_videos (language);
CREATE INDEX IF NOT EXISTS idx_learning_videos_created_at ON learning_videos (created_at DESC);
