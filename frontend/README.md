# ElevenPray — Frontend (Next.js)

Aplicación web con login, registro y dashboard de rutinas semanales. Se comunica solo con el backend (no con la base de datos directamente).

## Requisitos

- Node.js 18+
- Backend de ElevenPray corriendo (por defecto en http://localhost:8080)

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

| Variable               | Descripción |
|------------------------|-------------|
| PORT                   | Puerto de Next.js (default: 3000) |
| NEXT_PUBLIC_API_URL    | URL del backend (ej. http://localhost:8080) |

En producción usa la URL pública de tu API.

## Scripts

| Comando        | Descripción |
|----------------|-------------|
| npm run dev    | Desarrollo |
| npm run build  | Build para producción |
| npm run start  | Servir build (tras build) |

## Estructura

- app/(auth)/ — login, register
- app/(protected)/ — dashboard, rutinas (requieren sesión)
- app/components/ — componentes reutilizables
- app/providers/ — AuthProvider, ThemeProvider
- app/lib/ — llamadas al API (auth-api, routines-api, api)

Abre http://localhost:3000 con el backend en marcha.
