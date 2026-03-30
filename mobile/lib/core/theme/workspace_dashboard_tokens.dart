import 'package:flutter/material.dart';

/// Tokens del workspace. Fondos neutros estilo app social (canvas plano).
abstract final class WorkspaceDashboardTokens {
  /// Canvas oscuro (#121212, estilo IG/TikTok).
  static const Color bgPrimary = Color(0xFF121212);
  /// Superficies elevadas (cards, tab bar).
  static const Color bgSecondary = Color(0xFF1C1C1C);

  /// Relleno de cards en modo claro.
  static const Color surfaceCardLight = Color(0xFFF2F2F2);
  /// Canvas claro.
  static const Color canvasLight = Color(0xFFFFFFFF);

  /// Bordes tipo Instagram.
  static const Color outlineDark = Color(0xFF262626);
  static const Color outlineLight = Color(0xFFDBDBDB);

  /// Compat: relleno semitransparente legacy (evitar en UI nueva; usar superficies sólidas).
  static const Color bgGlass = Color(0x0FFFFFFF);
  static const Color bgGlassHover = Color(0x1AFFFFFF);

  static const Color glassBorder = Color(0xFF262626);
  static const Color glassBorderActive = Color(0xFF3D3D3D);

  static const Color uniPrimary = Color(0xFF4F7FFF);
  static const Color uniSecondary = Color(0xFF7B9FFF);
  static const Color uniAccent = Color(0xFFA5BFFF);
  static const Color uniCardBg = Color(0x264F7FFF);
  static const Color uniGlow = Color(0x4D4F7FFF);

  static const Color skinPrimary = Color(0xFFFF6B9D);
  static const Color skinSecondary = Color(0xFFFFB3CC);
  static const Color skinAccent = Color(0xFFFFD6E7);
  static const Color skinCardBg = Color(0x26FF6B9D);
  static const Color skinGlow = Color(0x4DFF6B9D);

  static const Color devPrimary = Color(0xFF22C55E);
  static const Color devSecondary = Color(0xFF4ADE80);
  static const Color devGlow = Color(0x4D22C55E);

  static const Color genericPrimary = Color(0xFF8B5CF6);
  static const Color genericSecondary = Color(0xFFA78BFA);
  static const Color genericGlow = Color(0x4D8B5CF6);

  static const Color statusCompleted = Color(0xFF00D4AA);
  static const Color statusPending = Color(0xFF7B61FF);
  static const Color statusCancelled = Color(0xFFFF6B6B);
  static const Color statusOngoing = Color(0xFFFFB830);

  static const Color textPrimary = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFA8A8A8);
  static const Color textMuted = Color(0xFF737373);

  static const double blurGlass = 0;
  static const double blurCard = 0;
  static const double radiusGlassCard = 16;
  static const double radiusSearch = 12;
  static const double radiusChip = 100;

  /// Sombra muy suave solo donde haga falta (modo claro).
  static const List<BoxShadow> shadowCardLight = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> shadowCard = [];

  static List<BoxShadow> shadowGlowUni = [
    BoxShadow(
      color: uniGlow.withValues(alpha: 0.25),
      blurRadius: 16,
      spreadRadius: -2,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> shadowGlowSkin = [
    BoxShadow(
      color: skinGlow.withValues(alpha: 0.25),
      blurRadius: 16,
      spreadRadius: -2,
      offset: const Offset(0, 4),
    ),
  ];
}
