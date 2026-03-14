# Prompt para ChatGPT: generar INSERTs de contenido educativo (Learning)

Copia y pega el siguiente bloque a ChatGPT para que te devuelva las sentencias SQL (INSERT) con las que rellenar las tablas `learning_articles` y `learning_videos` y poder ver artículos y vídeos en la sección Aprender del workspace Skincare.

---

## Texto para ChatGPT

Necesito que me generes sentencias **INSERT** en SQL (PostgreSQL) para rellenar dos tablas de contenido educativo de skincare. Las tablas ya existen; solo necesito los INSERT con datos de ejemplo realistas.

### Tabla 1: learning_articles

- **id**: UUID, se puede omitir (la base usa `DEFAULT uuid_generate_v4()`).
- **title**: TEXT NOT NULL. Título del artículo.
- **description**: TEXT, opcional. Descripción corta (1–2 frases).
- **url**: TEXT NOT NULL. URL externa del artículo (ej. blog, medio).
- **image_url**: TEXT, opcional. URL de una imagen representativa.
- **source_name**: TEXT, opcional. Nombre del sitio o autor (ej. "Instituto Dermatológico", "Blog X").
- **tags**: JSONB, opcional. Array de strings, ej. `'["retinol", "rutina", "acné"]'::jsonb`.
- **language**: TEXT, default `'es'`. Usa `'es'` para español.
- **is_featured**: BOOLEAN, default false. Pon `true` en 2–3 artículos para destacados.
- **created_at**: TIMESTAMPTZ, se puede omitir (default `now()`).

Genera **al menos 8–10 artículos** en español sobre skincare: rutinas, ingredientes (retinol, ácido hialurónico, vitamina C, niacinamida), tipos de piel, orden de aplicación, SPF, acné, hidratación, etc. Las URLs pueden ser de ejemplo (ej. `https://ejemplo.com/articulo-retinol`). Si quieres, usa URLs reales de blogs o medios de skincare en español.

### Tabla 2: learning_videos

- **id**: UUID, se puede omitir (DEFAULT uuid_generate_v4()).
- **title**: TEXT NOT NULL. Título del vídeo.
- **description**: TEXT, opcional. Descripción corta.
- **video_url**: TEXT NOT NULL. URL del vídeo (YouTube, Vimeo, etc.).
- **thumbnail_url**: TEXT, opcional. URL de la miniatura.
- **source_name**: TEXT, opcional. Ej. "YouTube", nombre del canal.
- **tags**: JSONB, opcional. Array de strings.
- **language**: TEXT, default `'es'`.
- **created_at**: TIMESTAMPTZ, se puede omitir.

Genera **al menos 6–8 vídeos** en español. Puedes usar URLs reales de YouTube (formato `https://www.youtube.com/watch?v=VIDEO_ID`) de canales de dermatología o skincare en español, o URLs de ejemplo. Incluye temas como: rutina mañana/noche, retinol, acné, orden de productos, contorno de ojos, protector solar, etc.

### Formato que quiero

- Solo sentencias **INSERT** en SQL válidas para PostgreSQL.
- Para **learning_articles**: listar las columnas explícitamente (title, description, url, image_url, source_name, tags, language, is_featured) y los valores; no incluyas `id` ni `created_at` para que usen el default.
- Para **learning_videos**: igual, columnas (title, description, video_url, thumbnail_url, source_name, tags, language) y valores; sin `id` ni `created_at`.
- En **tags** usa siempre el tipo JSONB, por ejemplo: `'["tag1", "tag2"]'::jsonb`.
- Los textos en español, sin comillas que rompan la SQL (escapar comillas simples con `''` si hace falta).

Al final, dame los INSERT listos para ejecutar en orden: primero todos los de `learning_articles`, luego todos los de `learning_videos`.
