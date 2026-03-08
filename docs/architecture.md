# Arquitectura ElevenPray

## Visión general

ElevenPray evoluciona hacia una **plataforma de workspaces verticales** (Skincare, Universidad, Trabajo, Fitness). Jerarquía: **User → Workspace → Space → Page → Block/Container**. Se mantiene auth JWT y la rutina semanal (routine_templates por workspace).

- **Backend (NestJS):** API REST en capas; módulos: auth, users, workspaces, spaces, pages, blocks, containers, routine-templates, dashboard.
- **Frontend (Next.js):** Rutas públicas (/, /login, /register) y protegidas (/dashboard/*). Sidebar con WorkspaceSwitcher, SpaceList, PageTree; editor de páginas con blocks (estilo Notion).

## Modelo de datos (Workspaces)

- **users:** id, email, name, password_hash (sin cambios).
- **workspaces:** user_id, name, workspace_type (skincare | university | work | fitness | general), sort_order.
- **spaces:** workspace_id, title, position (secciones dentro del workspace).
- **pages:** workspace_id, space_id (opcional), parent_page_id (árbol), title, position.
- **containers:** page_id, title, position (agrupan blocks).
- **blocks:** page_id, container_id (opcional), type (text, checklist, image, …), content JSONB, position.
- **routine_templates:** workspace_id, user_id, week_label, year, week_number, days JSONB (rutina semanal; reutiliza editor actual).

Mapeo con modelo anterior: Topic → Workspace; Routine → routine_templates; topic_entries → páginas/entries por fecha (fase posterior).

## Backend

- **Entrada:** controllers, DTOs (class-validator).
- **Aplicación:** services (CRUD por módulo; dashboard agrega workspaces + routine_templates).
- **Dominio:** entidades User, Workspace, Space, Page, Block, Container, RoutineTemplate.
- **Común:** guards (JWT), decorators (@CurrentUser).

## Frontend

- **Auth:** AuthProvider con token y usuario; login/register y rutas protegidas.
- **Sidebar:** WorkspaceSwitcher + lista workspaces; dentro de cada workspace: SpaceList y PageTree.
- **Editor:** Página con BlockRenderer por tipo; Enter = nuevo bloque; slash menu; DnD (@dnd-kit).
- **Rutina semanal:** Vista especial (7 columnas L–D) para routine_templates del workspace; drawer "Mi día" en dashboard.
