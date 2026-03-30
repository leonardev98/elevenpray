import 'package:flutter/material.dart';

/// Tokens compartidos y paleta **modo claro** (tema activo por defecto).
/// El campo [gold] conserva el nombre histórico; el valor es el acento índigo de marca.
abstract final class AppColors {
  /// Acento principal (CTA, iconos activos, progreso).
  static const Color gold = Color(0xFF4F46E5);
  static const Color success = Color(0xFF059669);
  static const Color error = Color(0xFFDC2626);
  static const Color proAmber = Color(0xFFD97706);
  static const Color alertAmber = Color(0xFFB45309);

  static const double horizontalMargin = 20;
  static const double radiusCard = 20;
  static const double radiusButton = 14;

  // —— Modo claro (contraste AA-friendly sobre fondo suave) ——
  static const Color background = Color(0xFFF1F5F9);
  static const Color backgroundDeep = Color(0xFFE2E8F0);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color borderMuted = Color(0x330F172A);

  /// Borde claro del cristal (brillo superior).
  static const Color glassBorder = Color(0xD9FFFFFF);
  /// Sombra/halo del panel de vidrio.
  static const Color glassShadow = Color(0x140F172A);

  static Color get borderSubtle => gold.withValues(alpha: 0.22);

  /// Superficie sólida cuando no hay blur (chips, placeholders).
  static const Color surfaceSolid = Color(0xF5FFFFFF);
}

abstract final class AppColorsDark {
  static const Color background = Color(0xFF0A0A0A);
  static const Color surfaceNavy = Color(0xFF0F1E33);
  static const Color textPrimary = Color(0xFFF9F9F9);
  static const Color textSecondary = Color(0xFF8A8A9A);
  static const Color borderMuted = Color(0xFF2A2A3A);
  static Color get borderSubtle => AppColors.gold.withValues(alpha: 0.15);
}
