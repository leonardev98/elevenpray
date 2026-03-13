# Integración: Fotos → Mapa facial y análisis de piel

## Objetivo

Que cuando la persona suba fotos (workspace photos, ángulo frontal), se puedan:

1. **Mostrar granos/manchas en el mapa** como marcadores.
2. **Hacer que vayan apareciendo o desapareciendo** según nuevo reconocimiento/análisis (p. ej. comparar foto de hoy con la de hace 2 semanas).

## Flujo de datos

```
Fotos del workspace (angle: front) → Análisis (opcional) → Puntos (x%, y%) + tipo/severidad
                                                              ↓
Mapa facial (SVG) ← Marcadores con photoUrl, createdAt, issueType, severity
```

- Cada marcador ya soporta `photoUrl`: se puede vincular a la foto desde la que se creó.
- Las coordenadas `x`, `y` en el backend son porcentaje (0–100) del rostro; `z = 0`.

## Opciones tecnológicas

### 1. Marcadores manuales desde foto (ya implementado)

- Usuario elige una **foto frontal** del workspace.
- Haz **click en la foto** donde ve el grano/mancha.
- Se convierte ese click a **porcentaje** del rostro (zona central de la imagen como proxy del rostro).
- Se abre el formulario de marcador con posición y `photoUrl` rellenados.
- No requiere backend extra ni modelos.

### 2. Detección de rostro (landmarks) para mapear mejor

- **Objetivo:** Pasar de “click en imagen” a “porcentaje en nuestro mapa” con más precisión.
- **Opciones:**
  - **Face-API.js** (TensorFlow.js): detecta bounding box y landmarks en el navegador.
  - **MediaPipe Face Mesh**: landmarks 468; más preciso, algo más pesado.
- **Uso:** Con el bounding box (o landmarks) del rostro en la foto, convertir `(clickX, clickY)` en coordenadas relativas al rostro y luego a nuestro `xPercent`, `yPercent`. Así el “Importar desde foto” sigue siendo click del usuario, pero el mapeo es más fiable.

### 3. Detección automática de imperfecciones (granos, manchas)

Para que **aparezcan/sugieran solos** al subir la foto:

- **Backend + API externa:**  
  Endpoint tipo `POST /workspaces/:id/face/analyze-photo` con `{ imageUrl }`. Un servicio externo (dermatología AI / skin analysis) devuelve lista de detecciones, p. ej. `{ x, y, type?, confidence? }` en píxeles o normalizado. El backend convierte a porcentaje (0–100) y devuelve **sugerencias** de marcadores; el frontend los muestra y el usuario confirma/edita/elimina.
- **Modelo propio:** Entrenar un modelo (p. ej. detección de objetos o segmentación) para acné/manchas y ejecutarlo en backend (Python, etc.). Salida: posiciones en imagen → mismo mapeo a `xPercent`, `yPercent`.
- **Híbrido:** Detección de rostro en frontend (Face-API / MediaPipe) + llamada a API que solo analiza la región del rostro (crop) para reducir coste y mejorar precisión.

### 4. “Que vayan apareciendo o desapareciendo” (evolución en el tiempo)

- **Comparar por fecha:**  
  Fotos y marcadores tienen `photoDate` / `createdAt`. Para una “línea temporal”:
  - Por cada fecha con foto frontal, tener (o generar) un conjunto de marcadores (manual o desde análisis).
  - En el mapa se pueden filtrar por rango de fechas (ya existe timeline) y mostrar solo marcadores de ese período.
- **Aparecer:** Nueva foto → nuevo análisis → nuevas sugerencias de marcadores; el usuario las acepta y se crean.
- **Desaparecer:**  
  - Opción A: El usuario elimina el marcador cuando ve que ya no hay problema.  
  - Opción B: Si hay análisis por foto, “no detectado en la última foto” podría marcar el marcador como “mejorado” o sugerir archivarlo (requiere modelo/API que devuelva ausencia de lesión en zona).

## Contrato sugerido para backend (análisis de foto)

Para poder conectar un servicio de análisis más adelante:

```ts
// POST /workspaces/:workspaceId/face/analyze-photo
// Body: { imageUrl: string }
// Response: {
//   suggestions: Array<{
//     x: number;      // 0-100 (porcentaje rostro)
//     y: number;      // 0-100
//     issueType?: string;  // acne | blackheads | ...
//     severity?: 'mild' | 'moderate' | 'severe';
//     confidence?: number;
//   }>;
// }
```

- El frontend llama a este endpoint al “analizar esta foto”, recibe sugerencias y puede crear marcadores (con `photoUrl` = esa foto) tras confirmación del usuario.
- El backend puede usar un servicio externo o un modelo propio; lo importante es que la respuesta use **porcentaje (0–100)** para `x` e `y` del rostro, igual que el mapa.

## Resumen

| Enfoque | Qué hace | Dependencias |
|--------|----------|--------------|
| **Click en foto** | Usuario coloca marcadores a mano sobre la foto; se mapean a % del rostro (zona central). | Ninguna extra. |
| **Face detection en frontend** | Mismo flujo pero mapeo click → % más preciso usando bbox/landmarks. | Face-API.js o MediaPipe. |
| **API de análisis en backend** | La foto se analiza y se devuelven sugerencias de marcadores; usuario confirma. | Servicio externo o modelo propio. |
| **Evolución en el tiempo** | Filtro por fechas + nuevos análisis por foto = nuevos marcadores; el usuario quita los que ya no aplican. | Mismo modelo/API + lógica de fechas. |

La base actual (mapa SVG, marcadores con `x`, `y`, `photoUrl`, `createdAt`) está preparada para todo esto; el flujo “Importar desde foto” con click manual es el primer paso y no requiere cambios de esquema.
