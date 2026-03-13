-- ElevenPray - Migración 008: Catálogo de productos de skincare (bilingüe ES/EN)
-- Catálogo global: productos curados para que los usuarios busquen y añadan a su rutina.
-- Requiere: uuid_generate_v4(), set_updated_at(). Ejecutar después de migraciones base.

CREATE TABLE IF NOT EXISTS catalog_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Bilingüe: siempre rellenar al menos uno de los dos por columna
  name_es TEXT,
  name_en TEXT,
  name TEXT,  -- fallback: COALESCE(name_es, name_en) al insertar si quieres compatibilidad
  brand TEXT,
  category TEXT NOT NULL
    CHECK (category IN (
      'cleanser', 'moisturizer', 'sunscreen', 'serum', 'retinoid', 'exfoliant',
      'toner', 'eye_care', 'spot_treatment', 'mask', 'oil', 'essence', 'balm'
    )),
  description_es TEXT,
  description_en TEXT,
  description TEXT,
  benefits JSONB,           -- array de strings, ej. ["Hidratación", "Refuerzo barrera"]
  ingredients JSONB,       -- array de strings (INCI o nombres)
  concern_tags JSONB,      -- array: acné, arrugas, manchas, rosácea, etc.
  skin_type_compatibility JSONB,  -- array: oily, dry, combination, sensitive, normal
  usage_instructions_es TEXT,
  usage_instructions_en TEXT,
  usage_instructions TEXT,
  experience_level TEXT,   -- beginner, intermediate, advanced (opcional)
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  warnings_es TEXT,
  warnings_en TEXT,
  warnings TEXT,
  routine_position TEXT,   -- am, pm, both (opcional)
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products (category);
CREATE INDEX IF NOT EXISTS idx_catalog_products_brand ON catalog_products (brand);
CREATE INDEX IF NOT EXISTS idx_catalog_products_published ON catalog_products (published);
CREATE INDEX IF NOT EXISTS idx_catalog_products_concern_tags ON catalog_products USING GIN (concern_tags);

DROP TRIGGER IF EXISTS tr_catalog_products_updated_at ON catalog_products;
CREATE TRIGGER tr_catalog_products_updated_at
  BEFORE UPDATE ON catalog_products
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();

-- Tabla de favoritos: usuario/workspace guarda productos del catálogo
CREATE TABLE IF NOT EXISTS catalog_product_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  catalog_product_id UUID NOT NULL REFERENCES catalog_products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id, catalog_product_id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_product_bookmarks_user_workspace
  ON catalog_product_bookmarks (user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_catalog_product_bookmarks_catalog_id
  ON catalog_product_bookmarks (catalog_product_id);
