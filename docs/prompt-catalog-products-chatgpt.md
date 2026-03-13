# Prompt para ChatGPT: catálogo de productos skincare para la BD

La tabla `catalog_products` **ya existe** con el esquema que tienes en tu BD. Aquí tienes:

1. **Script para borrar todos los productos** (ejecutar primero).
2. **Prompt para ChatGPT** con el formato exacto de la tabla para que te devuelva la query de INSERT y rellenes la BD.

---

## Paso 1: Borrar todos los productos

Ejecuta en tu base de datos (Supabase, DBeaver, etc.):

```sql
DELETE FROM catalog_products;
```

Si existe la tabla `catalog_product_bookmarks` y tiene FK a `catalog_products`, puede que tengas que borrar antes los bookmarks o que la FK tenga `ON DELETE CASCADE` (en ese caso al borrar el producto se borran solos los bookmarks; el `DELETE` de arriba solo vacía `catalog_products`).

---

## Paso 2: Prompt para ChatGPT (llenar la BD)

Copia **todo** el bloque desde **"--- INICIO PROMPT ---"** hasta **"--- FIN PROMPT ---"** y pégalo en ChatGPT. Pídele que te devuelva un script SQL solo con los `INSERT` (o con `DELETE FROM catalog_products;` + `INSERT` si quieres todo en uno), con muchos productos en español (o en inglés), priorizando marcas disponibles en **Perú** (CeraVe, Neutrogena, La Roche-Posay, etc.).

---

--- INICIO PROMPT ---

Necesito que me des **una única query SQL para PostgreSQL** que llene la tabla `catalog_products` con muchos productos de skincare. Tu respuesta debe ser **directamente el script SQL** listo para copiar y pegar en la base de datos (no explicaciones antes del código; el código SQL completo).

La tabla `catalog_products` ya existe. Tiene exactamente este esquema (respeta nombres de columnas y tipos):

**Columnas:**

| Columna | Tipo | Obligatorio | Descripción |
|--------|------|-------------|-------------|
| id | UUID | No | No la incluyas; se autogenera con `uuid_generate_v4()` |
| name | TEXT | **Sí** | Nombre del producto |
| brand | TEXT | No | Marca (ej. CeraVe, Neutrogena, La Roche-Posay) |
| category | TEXT | **Sí** | Una de: `cleanser`, `moisturizer`, `sunscreen`, `serum`, `retinoid`, `exfoliant`, `toner`, `eye_care`, `spot_treatment`, `mask`, `oil`, `essence`, `balm` |
| description | TEXT | No | Descripción corta del producto |
| ingredients | JSONB | No | Array de strings, ej. `["niacinamide", "ceramides"]` → en SQL: `'["niacinamide", "ceramides"]'::jsonb` |
| concern_tags | JSONB | No | Array de preocupaciones, ej. `["acné", "manchas", "arrugas"]` → `'["acné", "manchas"]'::jsonb` |
| skin_type_compatibility | JSONB | No | Array: `["oily", "dry", "combination", "sensitive", "normal"]` → `'["oily", "combination"]'::jsonb` |
| usage_instructions | TEXT | No | Cómo usar el producto |
| warnings | TEXT | No | Advertencias |
| routine_position | TEXT | No | `am`, `pm` o `both` |
| image_url | TEXT | No | URL de imagen (puedes poner NULL) |
| published | BOOLEAN | No | Por defecto en la BD es `false`; si quieres publicados, pon `true` |
| sort_order | INTEGER | No | Por defecto `0` |
| benefits | JSONB | No | Array de beneficios, ej. `["Hidratación", "Refuerzo de barrera"]` → `'["Hidratación"]'::jsonb` |
| experience_level | TEXT | No | Solo: `beginner`, `intermediate` o `advanced` |
| rating | INTEGER | No | Entre 1 y 5 (entero) |
| created_at / updated_at | TIMESTAMPTZ | No | No las incluyas; la BD usa `DEFAULT now()` |

**Formato del INSERT que quiero:**

```sql
INSERT INTO catalog_products (
  name, brand, category, description,
  ingredients, concern_tags, skin_type_compatibility,
  usage_instructions, warnings, routine_position, image_url,
  published, sort_order, benefits, experience_level, rating
) VALUES
  (
    'Gel limpiador purificante',
    'CeraVe',
    'cleanser',
    'Limpiador espumoso con ceramidas para piel grasa.',
    '["ceramides", "niacinamide"]'::jsonb,
    '["acné", "piel grasa"]'::jsonb,
    '["oily", "combination"]'::jsonb,
    'Aplicar sobre piel húmeda, masajear y enjuagar.',
    'Evitar contacto con ojos.',
    'both',
    NULL,
    true,
    0,
    '["Ceramidas", "Limpieza suave"]'::jsonb,
    'beginner',
    5
  ),
  -- más productos...
  ;
```

**Instrucciones:**

- Prioriza marcas disponibles en **Perú**: CeraVe (Foaming, Hydrating, SA Smoothing, Detox), Neutrogena (Hydro Boost, Retinol, etc.), La Roche-Posay, Eucerin, Vichy, L'Oréal, Garnier y similares.
- Cubre todas las categorías: cleanser, moisturizer, sunscreen, serum, retinoid, exfoliant, toner, eye_care, spot_treatment, mask, oil, essence, balm, con varios productos por categoría.
- Nombres y descripciones en **español** (o en inglés si lo prefieres; indica el idioma).
- No incluyas `id`, `created_at` ni `updated_at` en el INSERT.
- Para campos JSONB usa siempre la forma: `'["valor1", "valor2"]'::jsonb`.

**Importante:** Devuélveme únicamente el script SQL listo para ejecutar (que empiece por `INSERT INTO catalog_products (...)` con muchos productos). Sin explicaciones largas antes; el código SQL completo para que yo lo copie y lo ejecute en mi base de datos.

--- FIN PROMPT ---

---

## Cómo usarlo

1. Ejecuta en tu BD: `DELETE FROM catalog_products;`
2. Pega en ChatGPT el bloque entre "--- INICIO PROMPT ---" y "--- FIN PROMPT ---" y pide el script de INSERT (o el script completo con DELETE + INSERT).
3. Ejecuta en PostgreSQL el script que te devuelva ChatGPT.

Si quieres productos en **inglés** además de español, puedes pedirle a ChatGPT un segundo script con los mismos productos pero con `name` y `description` en inglés y hacer dos cargas (por ejemplo una tabla temporal o ejecutar uno en español y luego actualizar, o mantener un solo idioma por producto según tu criterio).
