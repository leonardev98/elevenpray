# Diseño y paleta

## Paleta de colores

| Nombre  | Hex       | Uso principal        |
|---------|-----------|----------------------|
| Black   | `#0A0A0A` | Fondo oscuro, texto claro |
| White   | `#F9F9F9` | Fondo claro, texto oscuro |
| Navy    | `#0F1E33` | Botones primarios, acentos |
| Gold    | `#C8A96A` | Destacados, enlaces, bordes secundarios |

## Tema claro / oscuro

- **Claro:** fondo `#F9F9F9`, superficie blanca, texto `#0A0A0A`. Navy y gold para acciones.
- **Oscuro:** fondo `#0A0A0A`, superficie `#141414`, texto `#F9F9F9`. Gold se mantiene como acento.

La preferencia se guarda en `localStorage` (`elevenpray_theme`) y se aplica con la clase `.dark` en `<html>`. El botón de tema está en la esquina superior derecha (landing, login, register y header del dashboard).

## UI

- **Aside:** panel lateral con lista de tópicos y formulario "Nuevo tópico" (nombre + tipo: Rutina, Notas, Lista, Meta, Otro). Los tópicos se guardan en `localStorage` por ahora.
- **Tipografía:** variables CSS `--app-fg`, `--app-bg`, `--app-surface`, `--app-border`, `--app-accent`, `--app-highlight` (gold) para mantener consistencia entre temas.
