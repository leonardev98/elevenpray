import 'package:dio/dio.dart';

import 'api_config.dart';
import 'api_error_message.dart';
import 'dio_error_message.dart';
import 'dto/dashboard_week_dto.dart';
import 'dto/user_workspace_dto.dart';

class AuthUserDto {
  const AuthUserDto({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.avatarUrl,
  });

  final String id;
  final String email;
  final String name;
  final String role;
  final String? avatarUrl;

  factory AuthUserDto.fromJson(Map<String, dynamic> json) {
    return AuthUserDto(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? '',
      role: json['role'] as String? ?? 'user',
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        'avatarUrl': avatarUrl,
      };
}

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

/// Cliente HTTP del backend Mitsyy.
class MitsyyApi {
  MitsyyApi({String? baseUrl}) : _dio = Dio(_baseOptions(baseUrl ?? ApiConfig.baseUrl));

  final Dio _dio;

  static BaseOptions _baseOptions(String base) => BaseOptions(
        baseUrl: base,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      );

  static String _messageFromResponse(dynamic data) {
    if (data is Map && data['message'] != null) {
      final m = data['message'];
      if (m is List) return m.join(', ');
      return m.toString();
    }
    return 'Error del servidor';
  }

  Future<({String accessToken, AuthUserDto user})> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email.trim(), 'password': password},
      );
      final data = res.data;
      if (data == null) throw ApiException('Respuesta vacía');
      final token = data['accessToken'] as String?;
      final userRaw = data['user'] as Map<String, dynamic>?;
      if (token == null || userRaw == null) {
        throw ApiException('Formato de login inválido');
      }
      return (accessToken: token, user: AuthUserDto.fromJson(userRaw));
    } on DioException catch (e) {
      _rethrowDio(e);
    }
  }

  Future<({String accessToken, AuthUserDto user})> register({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'email': email.trim(),
          'password': password,
          'name': name.trim(),
        },
      );
      final data = res.data;
      if (data == null) throw ApiException('Respuesta vacía');
      final token = data['accessToken'] as String?;
      final userRaw = data['user'] as Map<String, dynamic>?;
      if (token == null || userRaw == null) {
        throw ApiException('Formato de registro inválido');
      }
      return (accessToken: token, user: AuthUserDto.fromJson(userRaw));
    } on DioException catch (e) {
      _rethrowDio(e);
    }
  }

  Future<AuthUserDto> me(String accessToken) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/auth/me',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      final data = res.data;
      if (data == null) throw ApiException('Respuesta vacía');
      return AuthUserDto.fromJson(data);
    } on DioException catch (e) {
      _rethrowDio(e);
    }
  }

  Future<List<UserWorkspaceDto>> listWorkspaces(String accessToken) async {
    try {
      final res = await _dio.get<List<dynamic>>(
        '/workspaces',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      final data = res.data;
      if (data == null) return [];
      return data.map((e) => UserWorkspaceDto.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      _rethrowDio(e);
    }
  }

  Future<DashboardWeekDto> fetchDashboardWeek({
    required String accessToken,
    required int year,
    required int week,
    required List<String> workspaceIds,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/dashboard/week/query',
        data: {
          'year': year,
          'week': week,
          'workspaceIds': workspaceIds,
        },
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      final data = res.data;
      if (data == null) throw ApiException('Respuesta vacía');
      return DashboardWeekDto.fromJson(data);
    } on DioException catch (e) {
      _rethrowDio(e);
    }
  }

  Never _rethrowDio(DioException e) {
    final code = e.response?.statusCode;
    if (e.response?.data != null) {
      final raw = _messageFromResponse(e.response!.data);
      throw ApiException(localizeApiError(statusCode: code, raw: raw), statusCode: code);
    }
    throw ApiException(dioErrorMessage(e), statusCode: code);
  }
}
