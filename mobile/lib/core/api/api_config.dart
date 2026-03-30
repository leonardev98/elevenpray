import 'package:flutter/foundation.dart' show TargetPlatform, defaultTargetPlatform, kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Base URL del backend (sin barra final). Define `API_BASE_URL` en `.env` (raíz de `mobile/`).
///
/// Flujo habitual con **móvil físico**: exponer Nest con **ngrok** (`ngrok http <puerto>`) y poner
/// la URL `https://….ngrok-free.app` en `.env`.
///
/// Si `.env` no define URL o está vacía: **Android** emulador → `10.0.2.2:8080`; **iOS / desktop / web**
/// → `127.0.0.1:8080` (solo desarrollo local sin túnel).
abstract final class ApiConfig {
  static String get baseUrl {
    try {
      final v = dotenv.maybeGet('API_BASE_URL')?.trim() ?? '';
      if (v.isNotEmpty) {
        return v.endsWith('/') ? v.substring(0, v.length - 1) : v;
      }
    } catch (_) {
      // Tests o arranque sin dotenv cargado.
    }
    if (kIsWeb) return 'http://127.0.0.1:8080';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }
}
