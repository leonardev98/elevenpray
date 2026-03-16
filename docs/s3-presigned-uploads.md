# Subida de archivos a S3 con presigned URL

Esta guía describe el flujo de subida de archivos a AWS S3 mediante **presigned URL** y sirve como referencia para la foto de perfil y futuras integraciones (fotos de workspace, etc.).

## Flujo general

1. **Frontend** pide al backend una URL firmada (presigned) indicando tipo de contenido y/o nombre del archivo.
2. **Backend** genera una clave S3 (`key`), firma una petición `PutObject` con el AWS SDK y devuelve la URL de subida y la URL pública del objeto.
3. **Frontend** hace un `PUT` directo a la URL firmada con el cuerpo del archivo (sin pasar por el backend).
4. Si aplica, el frontend actualiza el recurso (perfil, workspace, etc.) con la URL pública del archivo.

```
Frontend                    Backend                         S3
   |                           |                             |
   |  POST /.../upload-url     |                             |
   |  { contentType }           |                             |
   | ------------------------->|  getSignedUrl(PutObject)    |
   |                           | ---------------------------->|
   |  { uploadUrl, publicUrl }  |                             |
   | <-------------------------|                             |
   |                           |                             |
   |  PUT uploadUrl (body: file)                              |
   | -------------------------------------------------------->|
   |                           |                             |
   |  PATCH /auth/me { avatarUrl: publicUrl }                 |
   | ------------------------->|  users.update(avatarUrl)    |
   | <-------------------------|                             |
```

## Backend

### Variables de entorno

Configurar en `.env` del backend (nunca commitear credenciales):

- `AWS_REGION` — Región del bucket (ej. `us-east-1`)
- `AWS_ACCESS_KEY_ID` — Access Key de IAM
- `AWS_SECRET_ACCESS_KEY` — Secret Access Key de IAM
- `S3_BUCKET` — Nombre del bucket (ej. `mitsyy-bucket`)

### Módulo y servicio S3

- **Módulo:** `backend/src/s3/s3.module.ts` — Global, exporta `S3Service`.
- **Servicio:** `backend/src/s3/s3.service.ts`

Método principal:

```ts
getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds?: number
): Promise<{ uploadUrl: string; publicUrl: string }>
```

- `key`: ruta del objeto en el bucket (ej. `profile/{userId}/{uuid}.jpg`).
- `contentType`: debe coincidir con el que use el frontend en el `PUT`.
- `publicUrl`: URL pública del objeto (`https://{bucket}.s3.{region}.amazonaws.com/{key}`). Si más adelante se usa CloudFront, se cambiaría aquí.

El `key` lo construye el **llamador** (p. ej. AuthController) para mantener convenciones por caso de uso.

### Registro del módulo

`S3Module` está importado en `AppModule`, por lo que `S3Service` está disponible en cualquier módulo que lo inyecte.

### Endpoint de foto de perfil

- **Ruta:** `POST /auth/profile-photo/upload-url`
- **Auth:** JWT (guard `JwtAuthGuard`)
- **Body:** `{ contentType: string }` (debe ser tipo imagen, ej. `image/jpeg`)
- **Respuesta:** `{ uploadUrl: string; publicUrl: string }`

La clave S3 generada es: `profile/{userId}/{uuid}.{ext}` (ext según `contentType`).

### CORS en el bucket S3

El navegador hace un **preflight OPTIONS** antes del PUT porque enviamos el header `Content-Type` (p. ej. `image/jpeg`). Si el bucket no tiene CORS configurado con **AllowedHeaders** que incluya `Content-Type`, la petición falla con error de CORS.

**Checksums del SDK:** Por defecto el AWS SDK v3 puede incluir en la URL pre-firmada parámetros que exigen headers como `x-amz-checksum-crc32` y `x-amz-sdk-checksum-algorithm`. El navegador los incluye en el preflight; si **AllowedHeaders** no los permite, CORS falla. En este proyecto el cliente S3 está configurado con `requestChecksumCalculation: "WHEN_REQUIRED"` para no exigir esos headers en la subida con presigned URL (así el PUT solo envía `Content-Type`).

En la consola de AWS: **S3 → tu bucket → Permisos → Configuración de CORS (CORS configuration)**. Usa una configuración como esta:

```json
[
  {
    "AllowedHeaders": ["Content-Type"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

- **AllowedHeaders**: debe incluir al menos `Content-Type`. Si en el backend no usas `requestChecksumCalculation: "WHEN_REQUIRED"`, añade también `"x-amz-checksum-crc32"`, `"x-amz-sdk-checksum-algorithm"` o usa `["*"]`.
- **AllowedMethods**: `PUT` es necesario para la subida con presigned URL; `GET`/`HEAD` sirven para leer el objeto después.
- **AllowedOrigins**: `["*"]` vale para presigned URLs (no se envían cookies a S3). Si quieres restringir, pon el origen exacto de tu frontend (ej. `["https://tu-dominio.com", "http://localhost:3000"]`).

Guarda los cambios y espera unos segundos; luego prueba de nuevo la subida desde el frontend.

## Frontend

### Patrón de uso (subida directa del navegador a S3)

1. Obtener presigned URL: `getProfilePhotoUploadUrl(token, file.type)`.
2. Subir el archivo: `uploadFileToPresignedUrl(file, uploadUrl)` (PUT directo a S3 desde el navegador).
3. Actualizar recurso: `updateProfile(token, { avatarUrl: publicUrl })`.

El bucket S3 debe tener CORS configurado para permitir el origen del frontend y el header `Content-Type` (ver sección CORS más arriba). El backend usa `requestChecksumCalculation: "WHEN_REQUIRED"` para no exigir headers de checksum en la URL pre-firmada.

### Servicios y componentes

- **Foto de perfil:**
  - `frontend/app/lib/auth-api.ts`: `getProfilePhotoUploadUrl`, `uploadFileToPresignedUrl`, `updateProfile` con `avatarUrl`.
  - `frontend/app/.../settings/components/sections/profile-section.tsx`: input file, validación (imagen, máx. 2 MB), flujo: pedir URL → subir a S3 → actualizar perfil → refrescar usuario.

Para futuras subidas (p. ej. fotos de workspace):

- Crear un endpoint similar que reciba el contexto (workspaceId, etc.) y genere un `key` acorde.
- En frontend, un módulo/API específico que llame a ese endpoint y luego use `uploadFileToPresignedUrl`; el componente que maneje el input file orquestará: pedir URL → subir → actualizar recurso con la URL pública.

## Convenciones de keys S3

- **Avatar de perfil:** `profile/{userId}/{uuid}.{ext}`
- **Futuras:** p. ej. `workspaces/{workspaceId}/photos/{dateOrId}/{uuid}.{ext}` para fotos de progreso o similares.

Mantener un prefijo por tipo de recurso facilita políticas de bucket y limpieza.

## Seguridad

- No incluir credenciales AWS en el código; usar siempre variables de entorno.
- Mantener `.env` en `.gitignore` y no subir Secret Access Key al repositorio.
- Si una clave se filtra, rotarla en IAM y actualizar `AWS_SECRET_ACCESS_KEY` en el entorno.
- El backend solo genera URLs firmadas para usuarios autenticados y asigna keys según el contexto (p. ej. solo `profile/{userId}/...` para el usuario actual).
