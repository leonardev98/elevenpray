# ElevenPray

App de rutinas semanales (estilo Notion) con **frontend** (Next.js), **app móvil** (Expo / React Native) y **backend** (NestJS). La base de datos está en Supabase (PostgreSQL). Pensado para clonar y trabajar en equipo.

**Cada app tiene su propia carpeta y `package.json`:** no hay `package.json` en la raíz. Tras un `git pull`, instala y ejecuta en `frontend/`, `backend/` y, si trabajas en móvil, en `mobile/`.

## Arquitectura

```
Frontend web (Next.js, puerto 3000) ──┐
App móvil (Expo) ─────────────────────┼──→ Backend API (NestJS, puerto 8080)
                                      ↓
                            Supabase PostgreSQL
```

El frontend **nunca** se conecta a la base de datos; todo pasa por el backend.

## Estructura del repo

| Carpeta      | Descripción |
|-------------|-------------|
| `frontend/` | Next.js (React). Login, registro, dashboard, rutinas. |
| `backend/`  | API NestJS. Auth JWT, usuarios, rutinas. |
| `database/` | **Migraciones SQL** del schema. Necesarias para que el backend funcione. |
| `docs/`     | Documentación (arquitectura, API, diseño, setup). |
| `mobile/`   | Expo (React Native). Mismo API que el web; ver `mobile/README.md`. |

## Cómo empezar (desarrollo local)

Cualquier persona que clone el repo (tú o tu compañero) puede levantar el proyecto sin depender de tus credenciales. Cada uno puede usar su propio Supabase o compartir el mismo.

### 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd elevenpray
```

### 2. Base de datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com) (o usa uno compartido).
2. En **SQL Editor**, ejecuta en orden los scripts de `database/migrations/`:
   - `001_create_users.sql`
   - `002_create_routines.sql`
3. En **Settings → Database** copia la **Connection string (URI)** para el paso siguiente.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env` y define al menos:

- `DATABASE_URL` = la URI de Supabase (o tu PostgreSQL).
- `JWT_SECRET` = un secreto para firmar los JWT (cambia en producción).

Luego:

```bash
npm run start:dev
```

El API quedará en **http://localhost:8080**.

### 4. Frontend

En **otra terminal**:

```bash
cd frontend
npm install
cp .env.example .env.local
```

En `frontend/.env.local` asegura que esté:

- `NEXT_PUBLIC_API_URL=http://localhost:8080`

Luego:

```bash
npm run dev
```

Abre **http://localhost:3000**. Ya puedes registrarte e iniciar sesión.

### 5. App móvil (opcional)

```bash
cd mobile
npm install
cp .env.example .env
```

Ajusta `EXPO_PUBLIC_API_URL` en `mobile/.env` (en **Android emulator** suele ser `http://10.0.2.2:8080`; en **iOS Simulator** `http://localhost:8080`). Con el backend ya en marcha:

```bash
npx expo start
```

Detalles: [mobile/README.md](mobile/README.md). Web y móvil se **publican por separado**; solo comparten la URL del API en producción.

## Después de `git pull`

Si tras hacer pull algo falla (p. ej. frontend no arranca o falta un paquete):

```bash
cd frontend && npm install && npm run dev
```

y, si usas la app móvil:

```bash
cd mobile && npm install && npx expo start
```

y en otra terminal, si usas el backend:

```bash
cd backend && npm install && npm run start:dev
```

Cada carpeta tiene sus propias dependencias; no hace falta instalar nada en la raíz del repo.

## Resumen para tu compañero

- **Sí subas la carpeta `database/`** al repo. Así él puede ejecutar las migraciones en su Supabase (o en el que compartáis) y tener el mismo schema.
- No necesita tus `.env`: clona el repo, crea su proyecto en Supabase (o usa el mismo), ejecuta las migraciones, rellena su propio `backend/.env`, `frontend/.env.local` y, si usa móvil, `mobile/.env` (desde `mobile/.env.example`). Cero dependencias de tu máquina.

## Variables de entorno

| Dónde    | Archivo       | Imprescindible |
|----------|---------------|-----------------|
| Backend  | `backend/.env` | `DATABASE_URL`, `JWT_SECRET` |
| Frontend | `frontend/.env.local` | `NEXT_PUBLIC_API_URL` |
| Móvil    | `mobile/.env` | `EXPO_PUBLIC_API_URL` |

Detalles en `backend/README.md`, `frontend/README.md` y `mobile/README.md`.

## Build para producción

```bash
cd backend  && npm run build
cd frontend && npm run build
```

Despliega cada parte por separado (p. ej. frontend en Vercel, backend en Railway o Render, builds iOS/Android con [EAS](https://docs.expo.dev/eas/) o stores). En producción configura CORS, HTTPS en el API, y las URLs públicas del API en **web** (`NEXT_PUBLIC_API_URL`) y **móvil** (`EXPO_PUBLIC_API_URL`).
