# API ElevenPray

Base URL: `http://localhost:8080` (o la configurada en backend `.env`).

## Auth

### POST /auth/register

Body:
```json
{ "email": "string", "password": "string", "name": "string" }
```
Response: `{ "accessToken": "string", "user": { "id", "email", "name" } }`

### POST /auth/login

Body:
```json
{ "email": "string", "password": "string" }
```
Response: `{ "accessToken": "string", "user": { "id", "email", "name" } }`

### GET /auth/me (protegido)

Header: `Authorization: Bearer <token>`
Response: `{ "id", "email", "name" }`

## Routines

Todos los endpoints de rutinas requieren `Authorization: Bearer <token>`.

### GET /routines

Response: `[{ "id", "userId", "weekLabel", "year", "weekNumber", "days": { ... } }, ...]`

### GET /routines/:id

Response: `{ "id", "userId", "weekLabel", "year", "weekNumber", "days": { "monday": { "blocks": [...] }, ... } }`

### POST /routines

Body (ejemplo): `{ "weekLabel": "string", "year": number, "weekNumber": number, "days": { ... } }`
Response: routine creada.

### PATCH /routines/:id

Body: parcial de la routine.
Response: routine actualizada.

### DELETE /routines/:id

Response: 204 o 200.

## Modelo de Routine (ejemplo)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "weekLabel": "Semana 1",
  "year": 2025,
  "weekNumber": 1,
  "days": {
    "monday": { "blocks": [{ "type": "heading", "content": "Mañana" }, { "type": "list", "content": "Item 1" }] },
    "tuesday": { "blocks": [] }
  }
}
```

Tipos de bloque: `heading`, `list`, `text`.
