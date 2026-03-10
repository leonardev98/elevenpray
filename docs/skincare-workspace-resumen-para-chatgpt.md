# Skincare Workspace – Resumen para ChatGPT (mejoras UX/UI)

## Contexto de la aplicación

ElevenPray es una app de productividad y bienestar donde el usuario tiene un **dashboard** con varios **workspaces**. Cada workspace tiene un **tipo** (Skincare, Trabajo, Universidad, Fitness, General) que define qué capacidades tiene (rutina semanal, productos, journal, fotos, expertos, etc.). El workspace de tipo **Skincare** es el más completo: rutinas AM/PM, catálogo de productos, journal de piel, fotos de progreso, catálogo curado, conocimiento (artículos), vídeos, insights de comunidad y expertos/mentores.

La navegación global es: **sidebar** (Dashboard, Rutinas, lista de “Mis espacios” por tipo/categoría) + **header** (búsqueda, tema, usuario, logout) + **área principal**. Cuando entras a un workspace (ej. Skincare), el layout del workspace muestra **una barra de navegación horizontal** con todas las secciones disponibles y, en desktop, un **aside derecho** con “Tus productos” para skincare.

---

## Qué se implementó para el Skincare Workspace

### 1. Perfil de piel (onboarding obligatorio)

Al entrar por primera vez a un workspace Skincare, el usuario debe completar un **Skin Profile**: tipo de piel (grasa, seca, mixta, sensible, acneica), preocupaciones principales (acné, arrugas, ojeras, hidratación, etc.), nivel de sensibilidad, rango de edad (opcional) y nivel de experiencia (principiante/intermedio/avanzado). Se guarda en preferencias del workspace (`onboarding_answers`). Ese perfil debe servir para personalizar recomendaciones, rutina y contenido (parte aún por conectar en backend).

### 2. Dashboard del workspace (Overview)

En la ruta principal del workspace (`/dashboard/workspaces/:id`) se muestra:

- Título del workspace (nombre que puso el usuario).
- Si es Skincare: un bloque **SkincareDashboardCards** con cuatro tarjetas en grid: “Hoy” (rutina mañana/noche + enlace a rutina), “Racha” (placeholder de días seguidos), “Progreso” (último journal + número de fotos + enlaces a Journal y Fotos), “Para ti” (enlace al catálogo).
- Si tiene rutina: **WeekScheduleCard** (rutina semanal). Si la plantilla está vacía se muestra mensaje “Tu rutina está vacía. Organiza mañana y noche por día.” + botón “Armar rutina”; si tiene contenido se muestra rejilla de 7 días + botón “Armar rutina”.
- Enlaces rápidos a Productos (en móvil).
- Sección “Hoy” con enlace a rutina (cuando hay varias secciones).
- Secciones genéricas: Spaces (lista) y Pages (lista con crear página).

Todo esto vive dentro de una **tarjeta** (contenedor con borde, sombra, padding) que a su vez está al lado del aside de productos (en desktop).

### 3. Navegación entre secciones del workspace (el problema de UX/UI)

La forma actual de acceder a las secciones del workspace es **una sola barra de navegación horizontal** (tabs/pills) con todos los ítems en línea:

- **Overview** (página principal del workspace)
- **Rutina** (builder de rutina semanal AM/PM)
- **Productos** (productos del usuario en el workspace)
- **Journal** (check-ins diarios de piel)
- **Fotos** (fotos de progreso)
- **Catálogo** (base curada de productos, buscar/filtrar/guardar)
- **Conocimiento** (artículos y guías)
- **Vídeos** (guías en vídeo)
- **Insights** (comunidad, trending)
- **Expertos** (mentores/dermatólogos)

Cada ítem es un `<Link>` con estilo de pill (fondo cuando está activo, texto cuando no). La barra va dentro de la misma tarjeta que el contenido, con fondo gris suave (`bg-[var(--app-bg)]`) y `rounded-xl`. Es una lista plana de enlaces, sin agrupación ni jerarquía visual.

**No me gusta esta forma.** Esperaba algo más parecido a **componentes aislados** o una **mejor manera de exponer** estas secciones para que la UX/UI sea más clara, escalable y agradable. No quiero solo “una fila de tabs”; busco ideas de cómo organizar y mostrar el acceso a Overview, Rutina, Productos, Journal, Fotos, Catálogo, Conocimiento, Vídeos, Insights y Expertos de forma que:

- Se entienda qué es cada cosa sin abrumar.
- Escale si en el futuro hay más secciones o tipos de workspace.
- Se sienta moderno y alineado con referencias como Apple Health, Headspace, Notion, Aesop.
- Opcionalmente: componentes más “bloqueados” o agrupados (por ejemplo: “Mi rutina”, “Mi piel” (journal + fotos), “Aprender” (conocimiento + vídeos), “Comunidad” (insights), “Expertos”) en lugar de 10 ítems planos.

Solo necesito **ideas y propuestas** de estructura/navegación/componentes (sidebar secundario, cards de entrada, grupos, iconos, etc.), no que implementes código todavía.

### 4. Resto de secciones (páginas)

- **Rutina**: la ruta `/workspaces/:id/routine` redirige al editor de rutina (`/dashboard/routines/:templateId`). Hay un estado de loading con spinner y texto “Cargando tu rutina…”.
- **Productos**: lista/CRUD de productos del usuario (workspace_products).
- **Journal**: formulario de check-in (piel, notas) y listado de check-ins pasados.
- **Fotos**: listado de fotos de progreso (ángulo, fecha, notas).
- **Catálogo (library)**: listado de productos del catálogo global (catalog_products) con filtros por categoría, preocupación y búsqueda; botón guardar (bookmark) por producto.
- **Conocimiento** y **Vídeos**: páginas placeholder con texto y enlace “Volver al overview”.
- **Insights** y **Expertos**: páginas con contenido (expertos ya tiene listado de perfiles desde backend).

### 5. Aside de productos

En desktop, cuando el workspace es Skincare y tiene capacidad de “product vault”, se muestra un **aside derecho** (tarjeta con borde y sombra) con “Tus productos”, filtros por categoría y lista de productos del usuario con enlace “Añadir a rutina”. El contenido principal del workspace (nav + children) está en una tarjeta a la izquierda; el aside es otra tarjeta separada con `gap-6` para que no choque visualmente con la barra de navegación.

### 6. Backend y datos

- **Registro de tipos**: en frontend, el tipo `skincare` tiene `category: "vida_personal"` para mostrar en el sidebar global “Skincare” como título y “Vida personal” como subtítulo (no se muestra el nombre custom del workspace en la lista del sidebar).
- **Catálogo**: API de productos publicados del catálogo, bookmarks por usuario/workspace, y motor de conflictos de ingredientes (POST con lista de ingredientes, devuelve conflictos con mensaje).
- **Skin profile**: guardado en `user_workspace_preferences.onboarding_answers` (JSON con skinType, mainConcerns, sensitivityLevel, etc.).
- Migración DDL con tablas: catalog_products, catalog_product_bookmarks, ingredient_conflicts, knowledge_articles, knowledge_videos, routine_completions, user_reminders (parte aún sin UI/backend completo).

---

## Lo que pido a ChatGPT

1. **Alternativas de navegación/estructura** para las 10 secciones (Overview, Rutina, Productos, Journal, Fotos, Catálogo, Conocimiento, Vídeos, Insights, Expertos) que no sean “una sola fila de tabs/pills”. Ideas de:
   - Agrupación por bloques o categorías (ej. “Mi rutina”, “Mi piel”, “Aprender”, “Comunidad”, “Expertos”).
   - Uso de sidebar secundario, cards de entrada, iconos, o patrones tipo Apple Health / Notion / Headspace.
   - Cómo mostrar u ocultar secciones según el tipo de workspace sin que la UI se sienta recargada.

2. **Componentes más aislados**: si tiene sentido que cada “área” (rutina, journal, catálogo, etc.) sea un componente o vista más autocontenida y cómo encajar eso con la URL y el layout actual (una tarjeta principal + aside opcional).

3. **Referencias y buenas prácticas** de apps que manejan muchos módulos o secciones (salud, bienestar, productividad) para inspirar una navegación más clara y escalable.

Solo necesito **texto con ideas y recomendaciones**, no implementación en código.
