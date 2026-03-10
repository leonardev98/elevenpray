# DDL ElevenPray – Un solo archivo

Todo el esquema está consolidado en **un único archivo** para que no se te escape ninguna tabla ni tengas que ejecutar varios scripts.

## Qué ejecutar

**Archivo:** `docs/ddl-completo-elevenpray.sql`

1. Abre el SQL Editor de Supabase (o DBeaver).
2. Copia **todo** el contenido de `ddl-completo-elevenpray.sql`.
3. Pégalo y ejecuta.

Es idempotente: usa `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, etc., así que puedes ejecutarlo sobre una base ya existente sin romper nada (solo se crea lo que falta).

---

## Qué incluye (en orden interno)

| Sección | Tablas / cambios |
|--------|-------------------|
| 1. Usuarios y rutinas | `users`, `routines` (+ trigger updated_at) |
| 2. Tópicos | `topics`, `routines.topic_id`, `topic_entries` (+ trigger) |
| 3. Workspaces | `workspaces`, `spaces`, `pages`, `containers`, `blocks`, `routine_templates` (+ triggers) |
| 4. Tipos y subtipos | `workspace_types`, `workspace_subtypes` (+ seed), `workspaces.workspace_subtype_id`, update default_pages skincare |
| 5. Preferencias | `user_workspace_preferences` (con onboarding), `user_ui_state` (+ triggers) |
| 6. Módulos workspace | `workspace_products`, `workspace_checkins`, `workspace_photos` (+ triggers) |

---

Solo existe este archivo DDL en `docs/`; el resto se eliminó para evitar duplicados y confusión.
