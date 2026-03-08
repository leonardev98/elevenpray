# Base de datos PostgreSQL y Supabase

Esta guía explica cómo crear la base de datos para ElevenPray con PostgreSQL, usar DBeaver para administrarla y compartirla con Supabase.

## Crear la base en DBeaver

1. **Abrir DBeaver** y crear una nueva conexión:
   - Base de datos: PostgreSQL.
   - Host: `localhost` (o el que use tu instalación).
   - Puerto: `5432`.
   - Base de datos: por ejemplo `elevenpray`.
   - Usuario y contraseña: los de tu PostgreSQL local.

2. **Crear la base de datos** (si no existe):
   - Clic derecho en el servidor → "Create" → "Database".
   - Nombre: `elevenpray`.

3. **Ejecutar el DDL del proyecto:** en la raíz del repo está `docs/ddl-supabase.sql`. Copia su contenido y ejecútalo en el SQL Editor de Supabase (o en DBeaver) para crear las tablas `users` y `routines`.

## Usar Supabase para compartir la BD

1. **Crear un proyecto en Supabase** (supabase.com):
   - New Project → elegir organización.
   - Nombre del proyecto y contraseña para la base de datos (guardar bien la contraseña).

2. **Connection string**:
   - En el panel de Supabase: Project Settings → Database.
   - Ahí verás la URI de conexión (modo "Session" o "Transaction").
   - Formato típico:  
     `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres`

3. **Compartir con el equipo**:
   - El equipo usa la misma connection string (con la contraseña del proyecto).
   - En producción no subas la contraseña al repo: usa variables de entorno (`DATABASE_URL` o las que use el backend).

4. **Recomendaciones**:
   - Para desarrollo local puedes seguir usando PostgreSQL local y DBeaver.
   - Para despliegue o trabajo en equipo, apuntar el backend a la URI de Supabase mediante `DATABASE_URL` (o equivalente en TypeORM/Prisma).

## Schema en Git (migraciones)

El schema está versionado en la carpeta **`/database/migrations/`** para que tú y tu equipo no rompáis la base al cambiar cosas:

- `001_create_users.sql` – tabla `users` e índice por email.
- `002_create_routines.sql` – tabla `routines`, índices y trigger `updated_at`.
- `003_create_topics.sql` – tabla `topics`.
- `004_alter_routines_add_topic_id.sql` – columna `topic_id` en `routines`.
- `005_create_topic_entries.sql` – tabla `topic_entries` (entradas por fecha).

Si la BD está vacía, ejecutad las migraciones en orden (001, luego 002) en el SQL Editor de Supabase. Si ya tenéis las tablas creadas con `docs/ddl-supabase.sql`, no hace falta volver a ejecutarlas.

Para el esquema de workspaces (block system), ejecutad `docs/ddl-workspaces-create.sql` después de tener `users`. Para el registro de tipos y subtipos, ejecutad `docs/ddl-workspace-types.sql`. Para preferencias y estado UI del dashboard, ejecutad `docs/ddl-workspace-preferences.sql`. Para soporte de subtipos en workspaces, ejecutad `docs/ddl-workspaces-add-subtype.sql`. Resumen de la arquitectura type-driven en `docs/type-driven-architecture.md`.

## Backend con TypeORM

El backend ya usa TypeORM y se conecta con `DATABASE_URL` (ver `backend/.env.example`). Definid `DATABASE_URL` en `backend/.env` con la connection string de Supabase para que registro y login usen la BD real.
