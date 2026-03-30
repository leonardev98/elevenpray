import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Preferencia de apariencia global (estilo iOS/Android modernos: Auto / Claro / Oscuro).
enum AppAppearancePreference {
  system,
  light,
  dark,
}

class AppThemeModeNotifier extends ChangeNotifier {
  AppThemeModeNotifier(this._prefs);

  final SharedPreferences _prefs;

  static const _key = 'mitsyy_app_appearance';

  AppAppearancePreference _preference = AppAppearancePreference.dark;

  AppAppearancePreference get preference => _preference;

  ThemeMode get materialThemeMode => switch (_preference) {
        AppAppearancePreference.light => ThemeMode.light,
        AppAppearancePreference.dark => ThemeMode.dark,
        AppAppearancePreference.system => ThemeMode.system,
      };

  void loadPersistedState() {
    final raw = _prefs.getString(_key);
    _preference = switch (raw) {
      'light' => AppAppearancePreference.light,
      'system' => AppAppearancePreference.system,
      _ => AppAppearancePreference.dark,
    };
    notifyListeners();
  }

  Future<void> setPreference(AppAppearancePreference value) async {
    _preference = value;
    await _prefs.setString(_key, value.name);
    notifyListeners();
  }
}
