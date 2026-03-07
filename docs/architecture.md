# Arquitectura ElevenPray

## Visión general

- **Backend (NestJS):** API REST en capas: controllers + DTOs, services (casos de uso), entidades/dominio. Auth con JWT; rutinas semanales con CRUD protegido.
- **Frontend (Next.js):** Rutas públicas (/, /login, /register) y protegidas (/dashboard/*). Contexto de auth; llamadas al API con token.

## Backend

- **Entrada:** controllers, DTOs (validación opcional con class-validator).
- **Aplicación:** services (registro, login, CRUD rutinas).
- **Dominio:** entidades User, Routine (interfaces/clases).
- **Común:** guards (JWT), decorators (@CurrentUser).

## Frontend

- **Auth:** AuthProvider con token y usuario; login/register llaman al API y guardan token.
- **Protección:** layout de dashboard redirige a /login si no hay token.
- **API:** authApi (login, register, me), routinesApi (CRUD) con header Authorization.
