# fileingest

Microservicio Go para ingesta de archivos + RAG (retrieval-augmented generation) sobre Azure OpenAI (DeepSeek-V4-Flash).

Se ejecuta detrás del backend NestJS de ElevenPray. El frontend nunca lo llama directo: NestJS valida el JWT del usuario y reenvía a este servicio con un token interno (`X-Internal-Token`).

## Stack

- Go 1.22
- HTTP: `chi`
- DB: PostgreSQL (Supabase) + extensión `pgvector` via `pgx/v5` + `pgvector-go`
- LLM: Azure OpenAI v1 API (`/openai/v1`) — chat + embeddings con clave compartida
- PDF: `ledongthuc/pdf` (puro Go, sin CGO)
- Tokens: `tiktoken-go` (cl100k_base)
- S3: `aws-sdk-go-v2`

## Estructura

```
fileingest/
├── cmd/server/                 # entrypoint
├── internal/
│   ├── config/                 # carga .env tipada
│   ├── httpserver/             # router, middlewares, handlers
│   ├── domain/                 # tipos de dominio (Document, Chunk, errores)
│   ├── ingest/                 # extractor, chunker, pipeline
│   ├── llm/                    # cliente Azure OpenAI (chat + embeddings + streaming)
│   ├── rag/                    # retriever + orchestrator
│   ├── storage/postgres/       # pool pgx + repos con pgvector
│   ├── storage/s3/             # GetObject del bucket existente
│   └── observability/          # slog
├── migrations/                 # SQL (pgvector + tablas fileingest_*)
├── Dockerfile
├── Makefile
└── .env.example
```

## Variables de entorno

Ver `.env.example`. Mínimas requeridas: `DATABASE_URL`, `INTERNAL_API_TOKEN`, `AZURE_OPENAI_*`, `AWS_*` y `S3_BUCKET`.

## Setup local

```bash
cd fileingest
cp .env.example .env
# rellena DATABASE_URL, AZURE_OPENAI_API_KEY, INTERNAL_API_TOKEN, AWS_*

# Instala dependencias
go mod tidy

# Aplica la migración en Supabase
make migrate

# Levanta el servicio
make run
```

El API queda en `http://localhost:8090`.

## Endpoints

Todos los endpoints bajo `/v1` requieren el header `X-Internal-Token: <INTERNAL_API_TOKEN>`. `GET /healthz` es público.

### `GET /healthz`
Devuelve los deployments activos. Útil para checks de despliegue.

### `POST /v1/ingest`
Procesa un archivo ya subido a S3 (extracción → chunking → embeddings → persistencia).

```json
{
  "documentId": "uuid (opcional, el servidor genera uno si falta)",
  "workspaceId": "uuid",
  "userId": "uuid",
  "source": { "s3Key": "uploads/abc.pdf" },
  "mimeType": "application/pdf",
  "filename": "abc.pdf"
}
```

Respuesta `202 Accepted`:

```json
{ "documentId": "...", "status": "ready" }
```

### `GET /v1/documents/{id}/status`
Devuelve el estado actual (`pending|extracting|embedding|ready|failed`).

### `POST /v1/query`
RAG no-streaming. Devuelve respuesta + citas.

```json
{
  "workspaceId": "uuid",
  "documentIds": ["uuid"],
  "question": "¿De qué trata este documento?",
  "topK": 5
}
```

### `POST /v1/chat`
Chat con SSE. Eventos: `delta` (cada token), `citations` (al final, si `ragEnabled`) y `done`.

```json
{
  "workspaceId": "uuid",
  "contextDocumentIds": ["uuid"],
  "messages": [
    { "role": "user", "content": "Hola" }
  ],
  "ragEnabled": true,
  "topK": 5
}
```

## Flujo end-to-end

```
Frontend → NestJS (auth JWT, permisos por workspace)
         → fileingest (X-Internal-Token)
              ↳ S3 GetObject
              ↳ Azure OpenAI (embeddings + chat)
              ↳ Postgres + pgvector
```

## Integración con el backend NestJS

NestJS debe:

1. Leer `FILEINGEST_BASE_URL` y `FILEINGEST_INTERNAL_TOKEN` desde su `.env`.
2. Exponer endpoints propios (`POST /ai/ingest`, `POST /ai/chat`, …) que verifiquen JWT + ownership del workspace.
3. Reenviar la petición a `fileingest` añadiendo el header `X-Internal-Token`.
4. En el caso del chat con SSE, hacer streaming pass-through (pipe del body al `Response` del controller).

## Build & Docker

```bash
make build              # compila binario en bin/fileingest
make docker             # imagen fileingest:dev (distroless)
```
