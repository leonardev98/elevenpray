# Arquitectura type-driven (ElevenPray)

La plataforma está organizada por **tipos de workspace** y **subtipos**, con comportamiento basado en **capabilities** en lugar de `if (workspace.type === 'x')`.

## Capas

- **Core platform**: usuarios, workspaces (instancias), páginas, bloques, rutinas, dashboard, preferencias.
- **Type registry**: definiciones de tipos (`workspace_types`), subtipos (`workspace_subtypes`), capabilities y estructuras por defecto.

El comportamiento (¿tiene rutina?, ¿aparece en dashboard?) se decide consultando el registro o las capabilities del tipo, no con switches por tipo.

## Registro de tipos (código y BD)

- **Backend**: `backend/src/workspace-types/workspace-type.registry.ts` define los tipos en código (id, label, capabilities). El servicio `WorkspaceTypesService` lee primero de la tabla `workspace_types` si existe; si no hay filas, usa el registro en código (fallback).
- **Frontend**: `frontend/app/lib/workspace-type-registry.ts` mantiene la misma lista y expone `hasRoutineCapability(typeId)` y `getAllWorkspaceTypes()`.
- **Capabilities**: por ejemplo `hasRoutine`, `hasDashboardWidgets`. Para saber si un workspace tiene rutina se usa `hasRoutineCapability(workspace.workspaceType)` en lugar de listas fijas.

## Cómo añadir un nuevo tipo de workspace

1. **Solo código (sin tocar BD)**  
   - Backend: en `workspace-type.registry.ts` añade una entrada en `DEFINITIONS` con `id`, `label`, `capabilities`, `sortOrder`.  
   - Frontend: añade la misma entrada en `frontend/app/lib/workspace-type-registry.ts`.  
   - Si usas la BD: inserta una fila en `workspace_types` (el seed está en `docs/ddl-completo-elevenpray.sql`; puedes ampliarlo ahí).

2. **Comportamiento**  
   - Rutina: `capabilities.hasRoutine: true` hace que el workspace tenga plantilla de rutina y enlace en la UI.  
   - Dashboard: el dashboard filtra por capabilities al agregar datos (p. ej. rutinas solo para tipos con `hasRoutine`).

No hace falta añadir `if (type === 'nuevo_tipo')` en ningún sitio; basta con registrar el tipo y sus capabilities.

## Subtipos

- **Tabla**: `workspace_subtypes` (por `workspace_type_id`). Cada subtipo puede definir `default_pages` (JSONB) para crear páginas por defecto al crear el workspace.
- **Workspaces**: la columna `workspace_subtype_id` en `workspaces` es opcional. Al crear un workspace con subtipo, el backend crea las páginas definidas en `default_pages` del subtipo.
- **API**: `GET /workspace-subtypes?workspaceTypeCode=work` devuelve los subtipos de ese tipo. El modal de nuevo workspace muestra un selector de subtipo cuando el tipo elegido tiene subtipos.

## Cómo añadir un subtipo

1. Insertar en `workspace_subtypes` (o ampliar el seed en `docs/ddl-completo-elevenpray.sql`): `workspace_type_id`, `code`, `label`, `default_pages` (array de `{ "title": "...", "position": 0 }`), `sort_order`.
2. El frontend obtiene la lista vía `GET /workspace-subtypes?workspaceTypeCode=...`; no hace falta cambiar código para que aparezca en el modal.

## Dashboard: alcance y query

- **GET /dashboard/week?year=&week=**  
  Equivalente a “todos” los workspaces del usuario (comportamiento anterior).

- **POST /dashboard/week/query**  
  Body: `{ year, week, scope?, workspaceIds? }`.  
  - `scope`: `all` | `favorites` | `selected` | `current`.  
  - Si se envía `workspaceIds`, tiene prioridad sobre `scope`.  
  - El backend resuelve la lista de workspaces con `user_workspace_preferences` y `user_ui_state` y luego agrega datos (rutinas, entries) con los providers.

## Preferencias y estado UI

- **user_workspace_preferences**: por usuario y workspace: `favorite`, `visible_on_dashboard`, `sort_order`.  
  - `PATCH /workspace-preferences/workspaces/:workspaceId` para actualizar.  
- **user_ui_state**: por usuario: `current_workspace_id`, `selected_workspace_ids`, `sidebar_collapsed`.  
  - `GET/PATCH /workspace-preferences/ui-state` para leer y actualizar.

## DDL

Todo el esquema (users, routines, topics, workspaces, tipos, preferencias, etc.) está en **un solo archivo**: `docs/ddl-completo-elevenpray.sql`. Orden y uso en `docs/DDL-ORDEN-EJECUCION.md`. Detalle de setup en `docs/database-setup.md`.
