import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/api/mitsyy_api.dart';

/// Sesión JWT + usuario público; persiste en [SharedPreferences].
class AuthSession extends ChangeNotifier {
  AuthSession(this._prefs, this._api);

  final SharedPreferences _prefs;
  final MitsyyApi _api;

  static const _keyToken = 'mitsyy_auth_access_token';
  static const _keyUser = 'mitsyy_auth_user_json';

  String? _accessToken;
  AuthUserDto? _user;

  String? get accessToken => _accessToken;
  AuthUserDto? get user => _user;
  bool get isAuthenticated => _accessToken != null && _accessToken!.isNotEmpty;

  void restoreFromPrefs() {
    _accessToken = _prefs.getString(_keyToken);
    final raw = _prefs.getString(_keyUser);
    if (raw != null && raw.isNotEmpty) {
      try {
        _user = AuthUserDto.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {
        _user = null;
      }
    } else {
      _user = null;
    }
    notifyListeners();
  }

  Future<void> persistSession(String token, AuthUserDto user) async {
    _accessToken = token;
    _user = user;
    await _prefs.setString(_keyToken, token);
    await _prefs.setString(_keyUser, jsonEncode(user.toJson()));
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await _api.login(email: email, password: password);
    await persistSession(res.accessToken, res.user);
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final res = await _api.register(email: email, password: password, name: name);
    await persistSession(res.accessToken, res.user);
  }

  Future<void> logout() async {
    _accessToken = null;
    _user = null;
    await _prefs.remove(_keyToken);
    await _prefs.remove(_keyUser);
    notifyListeners();
  }
}
