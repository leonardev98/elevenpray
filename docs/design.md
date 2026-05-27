# Diseño — Paper Design System (Mitsyy)

La fuente de verdad de colores, tipografía y tokens es [`frontend/app/globals.css`](../frontend/app/globals.css). Este documento resume el sistema para producto y landing.

## Paleta Paper

### Modo claro

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#F8F4EC` | Fondo principal (sepia) |
| `--bg-surface` | `#FFFCF5` | Tarjetas, paneles |
| `--bg-elevated` | `#FFFFFF` | Elementos elevados |
| `--text-primary` | `#1F1B14` | Títulos |
| `--text-body` | `#3D3833` | Cuerpo |
| `--text-muted` | `#7A7368` | Secundario |
| `--accent` | `#3D5A2F` | Botones primarios, enlaces (verde bosque) |
| `--accent-fg` | `#FFFCF5` | Texto sobre acento |
| `--accent-subtle` | `#E8EFD9` | Fondos suaves de acento |
| `--xp` | `#8A6E3D` | Gamificación, destacados dorados |

### Modo oscuro

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | `#1A1815` | Fondo principal |
| `--accent` | `#A8C087` | Acento (verde salvia) |
| `--text-primary` | `#F5F1E8` | Texto principal |

## Principios visuales

- **Sin violeta, neón ni gradientes “tech”** en producto y landing.
- Bordes y sombras suaves: `--border`, `--shadow-sm`, `--shadow-md`.
- Alias legacy `--app-*` mapean a tokens Paper para compatibilidad.

## Tipografía

- **Sans:** Inter (`--font-inter`) — UI, landing, app estudiante.
- **Mono:** Geist Mono, JetBrains Mono — código y snippets.

Escala definida en `globals.css` (`--font-size-*`, pesos, letter-spacing).

## Tema claro / oscuro

- Preferencia en `localStorage` (`elevenpray_theme`).
- Clase `.dark` / `[data-theme="dark"]` en `<html>`.
- Toggle en landing, auth y shell de la app.

## Landing

- Componente principal: [`frontend/app/components/landing.tsx`](../frontend/app/components/landing.tsx).
- Copy: `frontend/messages/es.json` y `en.json` → claves `landing`, `landingPricing`.
- Assets: `frontend/public/landing/` (mockups SVG alineados a Paper).

## Referencia histórica

La paleta anterior (Black `#0A0A0A`, Navy `#0F1E33`, Gold `#C8A96A`) quedó reemplazada por Paper. No usarla en componentes nuevos.
