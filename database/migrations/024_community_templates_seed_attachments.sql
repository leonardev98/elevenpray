-- ElevenPray - Migración 024: adjuntos de ejemplo para plantillas sin archivo (seed 023)
-- Idempotente.

UPDATE community_academic_templates
SET
  attachment_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  attachment_name = COALESCE(
    attachment_name,
    lower(regexp_replace(left(title, 48), '[^a-zA-Z0-9]+', '-', 'g')) || '.pdf'
  ),
  attachment_mime = COALESCE(attachment_mime, 'application/pdf'),
  attachment_size_bytes = COALESCE(attachment_size_bytes, 13264)
WHERE attachment_url IS NULL OR trim(attachment_url) = '';
