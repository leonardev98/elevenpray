# Expert Consultation — Diseño de producto y arquitectura

## Resumen

Módulo **genérico y reutilizable** que permite conectar a usuarios con expertos dentro de un workspace. Se controla por la capability **`hasExpertConsultation`**.

- **Skincare** → dermatólogos, esteticistas, especialistas en ingredientes, coaches de skincare.
- **Fitness** → entrenadores, coaches.
- **Universidad / Trabajo / Startup** → mentores, asesores.

No es un sistema de diagnóstico médico ni de tratamiento. Es **orientación y mentoría**. La UX debe ser premium, tranquila y de confianza, con disclaimers claros.

---

## Principio arquitectónico (Cursor rule)

- **No** componentes ni rutas por tipo (ej. `SkinMentorsPage`, `FitnessCoachesPage`).
- **Sí** un único flujo por capability: módulo `expert-consultation`, ruta `/workspaces/:id/experts`, componentes genéricos (`ExpertList`, `ExpertSessionInbox`, `AskQuestionFlow`).
- La **etiqueta** en la UI puede variar por tipo (Mentores, Coaches, Asesores) vía registro o i18n; la capacidad es la misma.

---

## Objetivo de producto

- Red de expertos **curada** dentro del workspace.
- Flujos: descubrir expertos, ver perfil, hacer pregunta, iniciar sesión, compartir rutina/productos/fotos, recibir feedback.
- Sesiones: mensajes asíncronos, revisión de rutina, feedback de progreso.
- Sensación: **premium, confiable, calmada, liderada por expertos**. Evitar UX de marketplace caótico.

---

## Modelo de datos (conceptual → tablas)

### Entidades genéricas (sin “skin” ni “fitness” en nombres)

| Concepto | Tabla | Descripción |
|----------|--------|-------------|
| Experto | `expert_consultation_experts` | Perfil: nombre, título, bio, avatar, activo. No atado a un workspace concreto. |
| Tipos de workspace que atiende | `expert_consultation_expert_workspace_types` | N:M experto ↔ tipo (skincare, fitness, university, work…). |
| Especialidades | `expert_consultation_specialties` | Código y etiqueta (dermatólogo, esteticista, coach, mentor, asesor). |
| Especialidades del experto | `expert_consultation_expert_specialties` | N:M experto ↔ especialidad. |
| Sesión | `expert_consultation_sessions` | user_id, workspace_id, expert_id, status (open/closed). |
| Mensaje | `expert_consultation_messages` | session_id, sender_type (user\|expert), body, meta (JSONB para adjuntos o tipo de feedback). |

Revisión de rutina y feedback de progreso se modelan como mensajes con `sender_type = 'expert'` y `meta.type` = `routine_review` o `progress_feedback` (y payload en `meta`). Así no hace falta una tabla extra de “reviews” en una primera fase.

### DDL

El DDL de este módulo no está en el repo (se eliminó para evitar confusión). Las tablas están descritas arriba; si se implementa el módulo, el SQL se puede recrear a partir de este documento o recuperar del historial de git.

---

## API (REST, anidadas bajo workspace)

Todas bajo `GET/POST .../workspaces/:workspaceId/...` y protegidas por JWT. El backend comprobará que el workspace del usuario tenga `hasExpertConsultation` (vía tipo de workspace).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/workspaces/:workspaceId/experts` | Lista expertos para ese tipo de workspace (filtro por workspaceType del workspace). |
| GET | `/workspaces/:workspaceId/experts/:expertId` | Perfil de un experto. |
| GET | `/workspaces/:workspaceId/expert-sessions` | Sesiones del usuario en ese workspace. |
| POST | `/workspaces/:workspaceId/expert-sessions` | Crear sesión (e.g. “ask question” → nueva sesión con primer mensaje). |
| GET | `/workspaces/:workspaceId/expert-sessions/:sessionId` | Detalle de sesión con mensajes. |
| POST | `/workspaces/:workspaceId/expert-sessions/:sessionId/messages` | Enviar mensaje (user o expert). |
| PATCH | `/workspaces/:workspaceId/expert-sessions/:sessionId` | Cerrar sesión, etc. |

Los expertos son “globales” por tipo: se listan por `workspace_type` del `workspaceId`, no por workspace concreto.

---

## UI y routing (frontend)

- **Nav del workspace**: si `hasExpertConsultationCapability(workspace.workspaceType)` → enlace “Expertos” (o “Mentores”/“Coaches” vía i18n más adelante).
- **Ruta**: `/dashboard/workspaces/[id]/experts` (y subrutas bajo `experts/`).
- **Vistas**:
  - **Discover**: lista de expertos (cards, especialidades, sensación premium).
  - **Perfil**: `/experts/[expertId]` — bio, especialidades, CTA “Preguntar” / “Iniciar sesión”.
  - **Inbox**: `/experts/sessions` — listado de sesiones del usuario en este workspace.
  - **Sesión**: `/experts/sessions/[sessionId]` — hilo de mensajes, opción de adjuntar rutina/productos/fotos según capabilities del workspace.
- **Flujo “Ask question”**: desde perfil o desde “Nueva pregunta” → crear sesión + primer mensaje.
- **Disclaimers**: en la página principal del módulo y/o en el flujo de “ask question”: texto tipo “Orientación educativa y de mentoría, no sustituye diagnóstico ni tratamiento médico”.

---

## Fases de implementación

1. **Fase 1 — Base**
   - Capability `hasExpertConsultation` en backend y frontend (solo skincare por ahora).
   - DDL y entidades del módulo `expert-consultation`.
   - Módulo Nest: controller bajo `workspaces/:workspaceId/...`, servicio que verifique tipo de workspace.
   - Frontend: nav “Expertos”, ruta `/workspaces/[id]/experts`, página placeholder con disclaimer.

2. **Fase 2 — Expertos y descubrimiento**
   - Seed de especialidades y 1–2 expertos de ejemplo (skincare).
   - GET expertos por workspace (filtro por workspace type).
   - UI: lista de expertos (cards), página de perfil básica.

3. **Fase 3 — Sesiones y mensajes**
   - Crear sesión, listar sesiones, detalle de sesión con mensajes.
   - POST mensaje (usuario). UI: inbox y vista de conversación.

4. **Fase 4 — Experto y contenido enriquecido**
   - Flujo “compartir rutina/productos/fotos” (links o referencias en mensajes).
   - Mensajes con `meta.type` para routine_review y progress_feedback.
   - (Opcional) Panel o flujo para que el “experto” responda (según modelo de roles: mismo usuario con rol o usuario distinto).

5. **Fase 5 — Extensión a otros tipos**
   - Activar `hasExpertConsultation` para fitness, university, work en el registro.
   - Ajustar etiquetas (Mentores, Coaches, Asesores) si se desea por tipo (i18n o registro).

---

## UX y seguridad

- **Disclaimers** visibles: orientación educativa, no diagnóstico ni tratamiento.
- No presentar la plataforma como software de tratamiento médico.
- Diseño: cards claras, indicadores de especialidad, tono calmado y premium; evitar marketplace ruidoso.
