import 'package:dio/dio.dart';

String dioErrorMessage(DioException e) {
  if (e.response != null && e.response!.data != null) {
    final data = e.response!.data;
    if (data is Map && data['message'] != null) {
      final m = data['message'];
      if (m is List) return m.join(', ');
      return m.toString();
    }
  }

  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return 'Tiempo de espera agotado. Comprueba la red.';
    case DioExceptionType.connectionError:
      return 'No se pudo conectar al servidor.';
    case DioExceptionType.badCertificate:
      return 'Error de certificado SSL.';
    case DioExceptionType.cancel:
      return 'Petición cancelada.';
    case DioExceptionType.badResponse:
      return e.message ?? 'Error del servidor';
    case DioExceptionType.unknown:
      return e.message ?? 'Error de red';
  }
}
