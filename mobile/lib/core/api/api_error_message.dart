/// Convierte mensajes del API (Nest/class-validator, a veces en inglés) a texto claro en español.
String localizeApiError({
  required int? statusCode,
  required String raw,
}) {
  final t = raw.trim();
  if (t.isEmpty) {
    return _defaultForStatus(statusCode);
  }

  // Varias validaciones unidas
  if (t.contains(',') || t.contains(';')) {
    final parts = t.split(RegExp(r'[,;]')).map((s) => _mapPhrase(s.trim())).where((s) => s.isNotEmpty);
    return parts.join('. ');
  }

  return _mapPhrase(t);
}

String _defaultForStatus(int? code) {
  switch (code) {
    case 401:
      return 'Correo o contraseña incorrectos.';
    case 403:
      return 'No tienes permiso para esta acción.';
    case 404:
      return 'No encontrado.';
    case 409:
      return 'Este correo ya está registrado. Inicia sesión o usa otro correo.';
    case 422:
    case 400:
      return 'Revisa los datos e inténtalo de nuevo.';
    case 429:
      return 'Demasiados intentos. Espera un momento.';
    case 500:
    case 502:
    case 503:
      return 'El servidor no está disponible. Inténtalo más tarde.';
    default:
      return 'Algo salió mal. Inténtalo de nuevo.';
  }
}

String _mapPhrase(String englishOrSpanish) {
  final lower = englishOrSpanish.toLowerCase();

  const pairs = <String, String>{
    'invalid credentials': 'Correo o contraseña incorrectos.',
    'user not found': 'Usuario no encontrado.',
    'email already registered': 'Este correo ya está registrado. Inicia sesión o usa otro correo.',
    'invalid current password': 'La contraseña actual no es correcta.',
    'email must be an email': 'Introduce un correo válido.',
    'email must be a valid email': 'Introduce un correo válido.',
    'password must be longer than or equal to 1 characters': 'La contraseña es obligatoria.',
    'password should not be empty': 'La contraseña es obligatoria.',
    'name should not be empty': 'El nombre es obligatorio.',
    'name must be longer than or equal to 1 characters': 'El nombre es obligatorio.',
    'property ': 'Dato no permitido.', // fragmento de forbidNonWhitelisted
    'should not exist': 'Hay campos no permitidos en la petición.',
    'must be a string': 'Formato de texto no válido.',
    'unauthorized': 'Correo o contraseña incorrectos.',
    'bad request': 'Revisa los datos e inténtalo de nuevo.',
  };

  for (final e in pairs.entries) {
    if (lower.contains(e.key)) {
      return e.value;
    }
  }

  // Si ya viene en español (p. ej. del backend), devolver tal cual
  if (_looksSpanish(englishOrSpanish)) {
    return englishOrSpanish;
  }

  return englishOrSpanish;
}

bool _looksSpanish(String s) {
  return s.contains('ñ') ||
      s.contains('á') ||
      s.contains('é') ||
      s.contains('í') ||
      s.contains('ó') ||
      s.contains('ú') ||
      s.contains('¿') ||
      s.contains('¡') ||
      RegExp(r'\b(el|la|los|las|correo|contraseña|debe|válid)\b', caseSensitive: false).hasMatch(s);
}
