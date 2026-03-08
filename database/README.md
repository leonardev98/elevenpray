# Schema de la base de datos

Migraciones SQL para ElevenPray. **Hay que ejecutarlas antes de usar el backend.**

## Cómo usarlas

1. Crea un proyecto en [Supabase](https://supabase.com) (o usa PostgreSQL local).
2. Abre el **SQL Editor** en Supabase (o tu cliente: DBeaver, psql, etc.).
3. Ejecuta los archivos **en este orden**:
   - `migrations/001_create_users.sql`
   - `migrations/002_create_routines.sql`
   - `migrations/003_create_topics.sql`
   - `migrations/004_alter_routines_add_topic_id.sql`
   - `migrations/005_create_topic_entries.sql`

Con eso quedan creadas las tablas `users`, `routines`, `topics` y `topic_entries`, con índices y triggers.

## ¿Por qué está en el repo?

Así cualquier persona que clone el proyecto (tú o tu compañero) puede crear el mismo schema en su propia base sin depender de la de nadie. Cada uno puede usar su propio proyecto de Supabase o la misma BD si comparten las credenciales.
