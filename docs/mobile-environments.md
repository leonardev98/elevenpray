# Móvil: entornos y URL del API

El cliente lee la base del API desde **`EXPO_PUBLIC_API_URL`** en tiempo de build de Metro (código en `mobile/src/config/env.ts`).

| Entorno | Dónde corre Metro | `EXPO_PUBLIC_API_URL` típica | Notas |
|--------|-------------------|-------------------------------|--------|
| Simulador iOS (Mac) | Mac | `http://localhost:8080` | El simulador comparte red con el Mac. |
| Emulador Android | PC | `http://10.0.2.2:8080` | Alias del host desde el emulador. |
| Dispositivo físico (misma Wi‑Fi) | PC / WSL | `http://<IPv4_LAN_del_PC>:8080` | No usar IP pública del router. No usar `localhost` en el teléfono. |
| WSL2 + iPhone | WSL | Misma IP LAN de **Windows** | Metro: **`npm start`** (túnel). API: ver [wsl2-expo-nest-network.md](wsl2-expo-nest-network.md) (portproxy, firewall, Safari, Nest en Windows vs WSL). |
| Staging / producción | EAS / CI | `https://api.tudominio.com` | Sin secretos en el repo: EAS env o CI secrets. |

**Metro (bundle JS)** y **API Nest** son dos cosas distintas: el túnel de Expo solo ayuda a que el teléfono descargue el JS; la app sigue llamando a `EXPO_PUBLIC_API_URL` para el backend.

Tras cambiar `.env`, reiniciar Metro con caché limpia (`npm run start:clear` o `npm run start:tunnel:clear`).
