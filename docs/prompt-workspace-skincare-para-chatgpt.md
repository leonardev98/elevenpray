# Prompt: Workspace Skincare — contexto para ChatGPT

Copia todo el texto desde "--- INICIO PROMPT ---" hasta "--- FIN PROMPT ---" y pégalo en ChatGPT para pedir ideas sobre cómo crear y mejorar bien este workspace.

---

--- INICIO PROMPT ---

Tengo una aplicación tipo Notion + rutinas semanales. Uno de los **tipos de workspace** es **Skincare**. El workspace de skincare es el más completo: tiene todas las capacidades activadas. Necesito ideas y recomendaciones para diseñar bien la experiencia, el contenido y las mejoras.

## Arquitectura (importante)

- La app es **type-driven**: no hay componentes llamados "SkincareRoutine" ni rutas "skincare/". El comportamiento se controla por **capabilities** del tipo de workspace (hasRoutine, hasProductVault, etc.). Skincare tiene todas estas capabilities en true; otros tipos (Fitness, Trabajo, etc.) tienen solo algunas.
- Todo es **genérico**: las mismas pantallas (Productos, Journal, Fotos, Rutina, Expertos) se reutilizan para cualquier tipo que tenga la capability. La diferencia es qué datos muestran y, si se quiere, etiquetas/i18n por tipo.
- Hay un **panel de administración** separado donde editores/admin suben **contenido curado** por categoría (enlaces, productos top, YouTube, textos) que luego los usuarios verán en la app. Ese contenido aún no está conectado; se mostrará en cada workspace según su tipo (ej. en Skincare, un bloque o sección con ese feed).

## Qué tiene hoy el workspace Skincare (capabilities activas)

1. **hasRoutine** — Rutina semanal (mañana/tarde). El usuario tiene una plantilla de rutina por workspace; puede tener slots AM/PM (hasRoutineSlots). Se edita en un editor de semana (días, grupos, ítems).
2. **hasProductVault** — Sección **Productos**: CRUD de productos (nombre, marca, categoría, ingredientes principales, uso AM/PM/both, estado: activo, testing, pausado, terminado, wishlist). Categorías: cleanser, moisturizer, sunscreen, serum, retinoid, exfoliant, toner, eye_care, spot_treatment, mask, oil, essence, balm.
3. **hasCheckins** — Sección **Journal**: check-ins por fecha con datos flexibles (JSONB). En la UI actual hay campos como "cómo sientes la piel" y notas libres.
4. **hasProgressPhotos** — Sección **Fotos**: fotos de progreso por fecha, ángulo (front, left, right), notas, tags de preocupaciones (JSONB), image_url.
5. **hasInsights** — Sección **Insights**: vista que cruza productos e ingredientes (qué productos contienen qué ingrediente, listado de ingredientes únicos). Pensado para ver duplicados o ingredientes que se repiten.
6. **hasRoutineSlots** — La rutina puede tener franjas AM y PM (slots) en el editor.
7. **hasExpertConsultation** — Sección **Expertos**: listado de expertos (dermatólogos, esteticistas, coaches) asociados al tipo de workspace; diseño para sesiones/mensajes y revisión de rutina (orientación, no diagnóstico médico). Módulo genérico; en skincare la etiqueta es "Expertos" o "Mentores".

## Navegación del workspace

Dentro de un workspace el usuario ve una barra de secciones (tabs) según capabilities:

- **Overview** — Página principal: título del workspace, enlaces rápidos a "Rutina de hoy" (AM/PM), **Spaces** (contenedores opcionales), **Pages** (páginas tipo Notion: lista de páginas raíz, crear nueva, enlazar a Library).
- **Rutina** — Redirige al editor de rutina semanal (plantilla del workspace).
- **Productos** — Lista y formulario de productos del vault.
- **Journal** — Check-ins por fecha (formulario rápido + listado histórico).
- **Fotos** — Fotos de progreso (fecha, ángulo, notas, imagen).
- **Library** — Lista de todas las páginas del workspace (acceso rápido a las mismas páginas que en Overview).
- **Insights** — Ingredientes y productos que los contienen.
- **Expertos** — Lista de expertos, disclaimer legal, flujo para conectar con ellos (diseño previsto: sesiones, mensajes, revisión de rutina).

## Páginas tipo Notion (por workspace)

- Cada workspace tiene **spaces** (opcionales) y **pages** (jerárquicas: parent_page_id). Las páginas tienen **containers** y **blocks**.
- **Tipos de bloque**: text, heading, list, checklist, image, file, link, code, callout, table, database, container, weekly_routine.
- Para **skincare**, los subtipos (ej. Acné, Anti-aging) pueden tener **páginas por defecto** al crear el workspace: Overview, Basics, Ingredients, Personal learnings, Saved inspiration, Derm notes. Son solo títulos iniciales; el contenido lo añade el usuario con bloques.

## Onboarding

- Al entrar por primera vez a un workspace con varias secciones (productos, journal, fotos, etc.) se muestra un modal de configuración: nivel (principiante / intermedio / avanzado) y un consejo (ej. "Introduce un producto nuevo a la vez y haz patch test cuando sea posible"). Se guarda en preferencias del usuario por workspace.

## Datos (resumen)

- **workspaces**: id, user_id, name, workspace_type ('skincare'), workspace_subtype_id (opcional).
- **routine_templates**: plantilla de rutina por workspace (year, week_number, days JSONB).
- **workspace_products**: productos del vault (campos descritos arriba).
- **workspace_checkins**: checkin_date, data JSONB.
- **workspace_photos**: photo_date, angle, notes, concern_tags JSONB, image_url.
- **pages / containers / blocks**: estructura Notion.
- **Expert consultation**: expertos, sesiones, mensajes (diseño en doc aparte; genérico por tipo).

## Objetivo de mi pregunta

Quiero **ideas y recomendaciones** para:

1. **Experiencia de usuario (UX)** — Cómo organizar mejor las secciones, flujos (ej. de producto nuevo → rutina → check-in), onboarding, y sensación "premium" y tranquila para skincare.
2. **Contenido curado** — El panel admin sube enlaces, productos top, rutinas ejemplo, YouTube. Dónde y cómo mostrar ese contenido dentro del workspace (bloque dedicado, página especial, feed en Overview, etc.) para que sea útil sin saturar.
3. **Funcionalidades que valen la pena** — Qué añadir o priorizar (ej. recordatorios, comparativa antes/después de fotos, integración con rutina, tips por ingrediente, progreso visual).
4. **Diferenciación por subtipo** — Skincare tiene subtipos (ej. Acné, Anti-aging). Cómo usar eso para contenido por defecto, recomendaciones o etiquetado sin romper la arquitectura type-driven (todo sigue siendo genérico por capability).
5. **Monetización** — El contenido curado se venderá por suscripción. Ideas para presentar valor (qué ver gratis vs qué ver suscrito) y para enganchar al usuario en el workspace de skincare.

Contexto técnico: frontend Next.js (App Router), backend NestJS, PostgreSQL. La app ya tiene lo descrito; busco dirección de producto y UX para mejorar y crear bien el workspace de skincare.

--- FIN PROMPT ---

---

**Uso:** Copia solo el bloque entre "--- INICIO PROMPT ---" y "--- FIN PROMPT ---" y pégalo en ChatGPT. Luego puedes añadir una pregunta concreta, por ejemplo: "Dame 5 ideas de UX para la sección Productos" o "¿Cómo mostraría el contenido curado del admin en el Overview?".
