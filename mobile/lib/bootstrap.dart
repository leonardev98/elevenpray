import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Carga [.env] en la raíz del paquete móvil (junto a [pubspec.yaml]), listado en `pubspec.yaml` → assets.
Future<void> loadAppDotenv() async {
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {
    // Permite ejecutar sin .env en desarrollo.
  }
}
