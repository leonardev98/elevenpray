# Setup ElevenPray

## Requisitos

- Node.js 20+
- npm

## Backend (puerto 8080)

```bash
cd backend
cp .env.example .env   # ajustar PORT=8080 y JWT_SECRET
npm install
npm run start:dev
```

Variables: `PORT` (ej. 8080), `JWT_SECRET` (obligatorio para firmar tokens).

## Frontend (puerto 3000)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Variables: `PORT=3000`, `NEXT_PUBLIC_API_URL=http://localhost:8080`.

## Usuario mock (sin base de datos)

Mientras no uses PostgreSQL, el backend crea al arrancar un usuario de prueba para poder entrar:

- **Email:** `admin`
- **Contraseña:** `admin`

Inicia sesión en el frontend con esos datos. Cuando tengas la BD y migres (ver `docs/database-setup.md`), podrás quitar este seed y usar solo usuarios registrados en la base.

## Orden recomendado

1. Levantar backend.
2. Levantar frontend.
3. Abrir http://localhost:3000 y entrar con `admin` / `admin` (o registrarte).
