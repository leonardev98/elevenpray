# WSL2 + Expo Go + NestJS: red y diagnóstico

Hay **dos canales de red distintos** en desarrollo:

| Canal | Qué es | Cómo suele funcionar en WSL2 + iPhone |
|--------|--------|--------------------------------------|
| **Metro (bundle JS)** | Expo sirve el código de `mobile/` al Expo Go | El QR con `exp://172.x.x.x` **no** llega al iPhone; usar **túnel** (`npm start` en este repo ya usa `--tunnel` por defecto). |
| **API Nest** | Tu backend en `backend/`, puerto típico **8080** | La app llama a `EXPO_PUBLIC_API_URL` (ej. `http://192.168.18.79:8080`). Si Nest corre **solo dentro de WSL2**, Windows **no reenvía** automáticamente ese puerto a la LAN: hace falta **portproxy + firewall** o levantar Nest en **Windows nativo**. |

Si `curl` en WSL o en `127.0.0.1` funciona pero el **iPhone no**, el problema es casi siempre **esta capa Windows ↔ WSL o firewall**, no el código de la app.

---

## Checklist de diagnóstico (en orden)

### 1. ¿Dónde está corriendo Nest?

En la terminal donde arrancaste el backend:

```bash
# En WSL:
echo "$WSL_DISTRO_NAME"
ss -tlnp | grep 8080
```

En **PowerShell (Windows)**:

```powershell
netstat -ano | findstr :8080
```

Anota si el PID corresponde a Node en WSL o en Windows.

### 2. curl desde Windows (PowerShell), no desde WSL

Sustituye `TU_IP_LAN` por la IPv4 de tu PC (Ethernet o Wi‑Fi, la misma que pusiste en `mobile/.env`):

```powershell
curl.exe http://TU_IP_LAN:8080/health
curl.exe http://TU_IP_LAN:8080/
curl.exe http://127.0.0.1:8080/health
```

- Si **127.0.0.1** va bien y **TU_IP_LAN** falla → suele ser **firewall** o **falta de portproxy** (Nest en WSL).
- Si ambos van bien en PowerShell pero el iPhone no → revisa misma Wi‑Fi y firewall **entrante** en 8080.

### 3. Safari en el iPhone

Abre (misma URL base que `EXPO_PUBLIC_API_URL`):

```text
http://TU_IP_LAN:8080/health
```

- Si **Safari no carga** → es **100 % red** (antes de culpar a Expo o al JS).
- Si **Safari muestra JSON** y la app no → caché de Metro/Expo Go o URL distinta en el bundle (revisa consola Metro con logs `[health]` en `__DEV__`).

---

## Solución A: Nest en WSL2 — portproxy + firewall

WSL2 tiene una IP interna que **cambia** al reiniciar Windows. Hay que decirle a Windows que el tráfico a `0.0.0.0:8080` (o a la IP LAN) vaya al puerto 8080 de WSL.

**Opción rápida:** ejecutar el script del repo **como administrador** en PowerShell:

```powershell
cd C:\ruta\a\elevenpray
.\scripts\wsl-portproxy-8080.ps1
```

(Desde WSL puedes invocar: `powershell.exe -ExecutionPolicy Bypass -File scripts/wsl-portproxy-8080.ps1` si la ruta es accesible desde Windows.)

**Regla de firewall (una vez, PowerShell como administrador):**

```powershell
New-NetFirewallRule `
  -DisplayName "ElevenPray Nest dev 8080" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8080 `
  -Action Allow
```

Tras **reiniciar Windows**, vuelve a ejecutar el script de portproxy (la IP de WSL habrá cambiado).

---

## Solución B: Nest en Windows nativo (recomendado si quieres evitar portproxy)

```powershell
cd C:\ruta\a\elevenpray\backend
npm install
npm run start:dev
```

Con `HOST=0.0.0.0` en `backend/.env`, el iPhone suele llegar directamente a `http://TU_IP_LAN:8080` sin portproxy. Puedes seguir usando **WSL solo para Metro** (`cd mobile && npm start`).

---

## Invalidar caché de Metro / Expo Go

```bash
cd mobile
rm -rf .expo
npm run start:tunnel:clear
# o: npm run start:clear
```

En el **iPhone**: cierra Expo Go por completo (quitar de multitarea) y vuelve a abrir el proyecto.

Comprueba que `mobile/.env` tenga la IP LAN correcta:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_LAN:8080
```

**No uses** `npm run start --clear` (npm interpreta mal el flag). Usa los scripts del `package.json` de `mobile/`.

---

## Tabla de flujos (resumen)

| Opción | Ventajas | Inconvenientes |
|--------|----------|----------------|
| Nest en **Windows** | Sin portproxy; iPhone → IP LAN simple | Dos entornos (PowerShell + WSL para frontend) |
| Nest en **WSL + portproxy** | Todo el código en WSL | Portproxy tras cada reinicio de Windows; firewall |
| Metro con **túnel** | QR siempre alcanzable desde el móvil | Más lento; a veces `npx expo login` |
| **Expo Dev Client** | Más control que Expo Go | Build inicial más largo |

**Recomendación práctica para este repo:** Nest en **Windows** para el API en LAN + `npm start` en `mobile/` (túnel) para el bundle. Así reduces variables ocultas.

---

## Referencias en el repo

- Variables móvil: [docs/mobile-environments.md](mobile-environments.md)
- Arranque móvil: [mobile/README.md](../mobile/README.md)
- Script portproxy: [scripts/wsl-portproxy-8080.ps1](../scripts/wsl-portproxy-8080.ps1)
