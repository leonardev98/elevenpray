import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'workspace_dashboard_tokens.dart';

/// Colores del dashboard que se adaptan al brillo global (claro / oscuro).
extension DashboardThemeExt on BuildContext {
  bool get isDarkDashboard => Theme.of(this).brightness == Brightness.dark;

  Color get dashTextPrimary =>
      isDarkDashboard ? WorkspaceDashboardTokens.textPrimary : AppColors.textPrimary;

  Color get dashTextSecondary =>
      isDarkDashboard ? WorkspaceDashboardTokens.textSecondary : AppColors.textSecondary;

  Color get dashTextMuted =>
      isDarkDashboard ? WorkspaceDashboardTokens.textMuted : AppColors.textSecondary.withValues(alpha: 0.75);

  /// Relleno sólido para inputs / chips (sin glass).
  Color get dashGlassBase => isDarkDashboard
      ? WorkspaceDashboardTokens.bgSecondary
      : WorkspaceDashboardTokens.surfaceCardLight;

  Color get dashGlassBorder =>
      isDarkDashboard ? WorkspaceDashboardTokens.outlineDark : WorkspaceDashboardTokens.outlineLight;

  Color get dashScaffoldBase =>
      isDarkDashboard ? WorkspaceDashboardTokens.bgPrimary : WorkspaceDashboardTokens.canvasLight;

  /// Superficie de card plana.
  Color get dashCardSurface => isDarkDashboard
      ? WorkspaceDashboardTokens.bgSecondary
      : WorkspaceDashboardTokens.surfaceCardLight;
}
