# Skincare Workspace – Arquitectura y diseño

## Objetivo de producto

El Skincare Workspace debe hacer sentir al usuario: *"Aquí gestiono mi piel, aprendo, sigo mi progreso y mantengo la constancia."*

Combina: **rutinas**, **catálogo de productos**, **seguimiento de progreso**, **contenido educativo**, **mentoría**, **insights de comunidad**, **base de conocimiento moderada** y **sistema de hábitos**.

---

## Principio arquitectónico (type-driven)

- No hay componentes ni rutas nombradas por tipo (ej. `SkincareDashboard`). Se usan componentes genéricos y **capabilities** del tipo `skincare` en el registro.
- El workspace tipo `skincare` tiene muchas capabilities activas; la UI muestra u oculta secciones según `hasRoutine`, `hasProductVault`, `hasKnowledgeHub`, etc.
- Comportamiento y estructura vienen de **datos** (workspace_types, default_pages) y del **perfil de piel** (onboarding_answers), no de `if (type === 'skincare')` en lógica de negocio.

---

## User Skin Profile (obligatorio antes de usar)

Al entrar por primera vez a un workspace de tipo skincare, el usuario debe completar un **Skin Profile Setup** (onboarding). Se guarda en `user_workspace_preferences.onboarding_answers` y `onboarding_completed_at`.

### Campos del perfil

| Campo | Tipo | Opciones / Notas |
|-------|------|------------------|
| skinType | string | oily, dry, combination, sensitive, acne_prone |
| mainConcerns | string[] | acne, wrinkles, dark_circles, hyperpigmentation, hydration, redness, large_pores, sun_damage |
| sensitivityLevel | string | low, medium, high |
| ageRange | string (opcional) | under_25, 25_35, 35_45, 45_plus |
| experienceLevel | string | beginner, intermediate, advanced |

Este perfil influye en: recomendaciones de productos, sugerencias de rutina, contenido educativo y sugerencias de mentores.

---

## Capabilities del tipo `skincare`

En `workspace_types` / registry:

- `hasRoutine` – Rutina semanal AM/PM
- `hasRoutineSlots` – Slots mañana/noche por día
- `hasProductVault` – Productos del usuario en el workspace
- `hasCheckins` – Journal diario (check-ins)
- `hasProgressPhotos` – Fotos de progreso
- `hasInsights` – Insights / comunidad (opcional)
- `hasExpertConsultation` – Mentores / expertos
- `hasKnowledgeHub` – Artículos y guías
- `hasVideoGuides` – Vídeos educativos
- `hasReminders` – Recordatorios (rutina mañana/noche, etc.)
- `hasCommunityInsights` – Rutinas populares, productos trending (opcional)

---

## Secciones del workspace (rutas y datos)

| Sección | Ruta | Fuente de datos | Descripción |
|---------|------|------------------|-------------|
| Dashboard | `/workspaces/:id` | routine_templates, routine_completions, checkins, photos, catalog | Hub: hoy, racha, progreso, recomendaciones |
| Rutina | `/workspaces/:id/routine` | routine_templates, workspace_products / catalog | Builder AM/PM por día; arrastrar productos; timers; marcar completado |
| Productos (míos) | `/workspaces/:id/products` | workspace_products | Productos del usuario en el workspace |
| Catálogo | `/workspaces/:id/library` | catalog_products, bookmarks | Base curada; buscar, filtrar, guardar, añadir a rutina |
| Journal | `/workspaces/:id/journal` | workspace_checkins | Piel, ánimo, brotes, notas, fotos |
| Fotos | `/workspaces/:id/photos` | workspace_photos | Progreso, comparador, timeline |
| Conocimiento | `/workspaces/:id/knowledge` | knowledge_articles | Artículos y guías |
| Vídeos | `/workspaces/:id/videos` o dentro de knowledge | knowledge_videos | Guías en vídeo |
| Expertos | `/workspaces/:id/experts` | expert_consultation | Mentores / dermatólogos |
| Insights | `/workspaces/:id/insights` | agregados / trending | Comunidad (opcional) |
| Recordatorios | Preferencias o modal | user_reminders | Horarios mañana/noche, etc. |

---

## Modelo de datos adicional

### Catálogo (global, moderado)

- **catalog_products**: nombre, marca, categoría, ingredientes (JSONB), preocupaciones (tags), tipo de piel compatible, instrucciones, advertencias, posición en rutina, imagen, etc.
- **catalog_product_bookmarks**: user_id, workspace_id, catalog_product_id (opcional: por workspace o por usuario).

### Conflictos de ingredientes

- **ingredient_conflicts**: ingredient_a, ingredient_b, severity (warning|danger), message_es, message_en. El motor comprueba ingredientes de productos en la rutina y muestra avisos.

### Conocimiento

- **knowledge_articles**: workspace_type (o global), title, slug, excerpt, content (o rich content), thumbnail_url, reading_time_min, published_at, sort_order.
- **knowledge_videos**: workspace_type, title, url (embed), thumbnail_url, duration_sec, sort_order.

### Rutina y hábitos

- **routine_completions**: workspace_id, user_id, completion_date, slot (am|pm), completed_at. Para rachas y “hoy completado”.

### Recordatorios

- **user_reminders**: user_id, workspace_id, reminder_type (morning_routine, night_routine, sunscreen_reapply), time_local (HH:mm), channels (in_app, push, email).

### Moderación

- Roles: `platform_admin`, `skincare_moderator` (o scope por workspace_type). Los moderadores gestionan: catalog_products, knowledge_articles, knowledge_videos, verificación de expertos.

---

## Motor de conflictos de ingredientes

- Al construir la rutina (o al añadir un producto desde el catálogo), el backend recibe la lista de productos (o IDs) y obtiene sus ingredientes (desde catalog_products o workspace_products con ingredientes).
- Servicio `IngredientConflictsService`: consulta `ingredient_conflicts` y devuelve pares en conflicto con mensaje y severidad.
- UI: mensaje tipo “Esta combinación puede irritar tu piel” y sugerencia de alternativas si aplica.

---

## Recomendaciones

- **RecommendationsService**: entrada = skin profile (onboarding_answers) + rutina actual + productos en uso + preocupaciones. Salida = productos del catálogo recomendados (por preocupación, huecos en rutina, compatibilidad con tipo de piel). Se exponen en dashboard y en library.

---

## UX

- Inspiración: Apple Health, Headspace, Notion, Aesop.
- Interfaz: minimal, elegante, calmada. Tipografía clara, sombras suaves, tarjetas limpias, animaciones suaves.
- Dashboard: anillos de completado, rachas, resumen de progreso, acceso rápido a rutina de hoy.
- Rutina: bloques tipo Notion; orden por arrastre; timer de espera entre pasos; notas por paso.

---

## Flujo de onboarding (Skin Profile)

1. Usuario entra a workspace tipo skincare.
2. Si no existe `onboarding_completed_at` en user_workspace_preferences, se muestra el modal/pantalla de **Skin Profile Setup** (skin type, concerns, sensitivity, age range, experience level).
3. Al guardar: PATCH preference con `completeOnboarding: true` y `onboardingAnswers: { skinType, mainConcerns, ... }`.
4. A partir de ahí, recomendaciones, rutina sugerida y contenido pueden personalizarse con este perfil.

---

## Resumen técnico

- **Backend**: módulos `CatalogProductsModule` (catálogo + bookmarks) e `IngredientConflictsModule` (POST `/ingredient-conflicts/check` con `{ ingredients: string[] }`). Pendientes: knowledge_articles, knowledge_videos, user_reminders, routine_completions.
- **Frontend**: onboarding de perfil de piel (Skin Profile) en layout para workspace skincare; dashboard con tarjetas Hoy, Racha, Progreso, Para ti; library como catálogo (filtros, tarjetas, guardar). API de conflictos disponible en `ingredient-conflicts-api.ts` para usarse al construir rutina.
- **DDL**: migración `003-skincare-workspace-tables.sql` con tablas catalog_products, catalog_product_bookmarks, ingredient_conflicts, knowledge_articles, knowledge_videos, routine_completions, user_reminders; skincare type con capabilities ampliadas en `workspace_types`.
