# ElevenPray — API (NestJS)

API REST con autenticación JWT, usuarios y rutinas semanales. Conexión a PostgreSQL (Supabase).

## Requisitos

- Node.js 18+
- PostgreSQL (Supabase o local) con el schema aplicado (ver carpeta `../database`)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable       | Descripción |
|----------------|-------------|
| `PORT`         | Puerto del servidor (default: 8080) |
| `JWT_SECRET`   | Secreto para firmar los JWT (cambiar en producción) |
| `DATABASE_URL` | URI de PostgreSQL. En Supabase: **Settings → Database → Connection string (URI)** |

Ejemplo de `DATABASE_URL` (Supabase):

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Base de datos

Antes de arrancar el API, el schema debe existir en la base. Desde la raíz del repo:

1. Entra en **Supabase → SQL Editor** (o tu cliente PostgreSQL).
2. Ejecuta en orden los scripts de `database/migrations/`:
   - `001_create_users.sql`
   - `002_create_routines.sql`

Si ya tienes las tablas creadas, no hace falta repetirlo.

## Scripts

| Comando           | Descripción |
|-------------------|-------------|
| `npm run start:dev` | Desarrollo (watch) |
| `npm run build`     | Compilar para producción |
| `npm run start`     | Ejecutar compilado |

## Estructura del código

```
src/
├── app.module.ts
├── main.ts
├── auth/           # Registro, login, JWT
├── users/          # Entidad y servicio de usuarios
├── routines/       # CRUD rutinas semanales
└── common/         # Guards, decoradores (JWT, CurrentUser)
```

Endpoints principales: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `GET|POST|PATCH|DELETE /routines`.
