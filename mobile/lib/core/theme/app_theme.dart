import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'app_typography.dart';
import 'workspace_dashboard_tokens.dart';

abstract final class AppTheme {
  static ThemeData get light {
    // surface transparente: el fondo lo pinta MitsyyAppBackground; si surface es
    // surfaceSolid, el Material del Scaffold/ruta deja un rectángulo opaco detrás
    // del shell (zona inferior del floating nav).
    final colorScheme = ColorScheme.light(
      surface: Colors.transparent,
      onSurface: AppColors.textPrimary,
      onSurfaceVariant: AppColors.textSecondary,
      primary: AppColors.gold,
      onPrimary: Colors.white,
      secondary: AppColors.textSecondary,
      onSecondary: AppColors.textPrimary,
      error: AppColors.error,
      onError: Colors.white,
      outline: AppColors.borderMuted,
      surfaceContainerHighest: Colors.transparent,
    );

    final textTheme = AppTypography.textTheme(
      onSurface: AppColors.textPrimary,
      onSurfaceVariant: AppColors.textSecondary,
      primary: AppColors.gold,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: Colors.transparent,
      colorScheme: colorScheme,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      cardTheme: CardThemeData(
        color: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppColors.radiusCard)),
        margin: EdgeInsets.zero,
        shadowColor: Colors.transparent,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        systemOverlayStyle: SystemUiOverlayStyle.dark.copyWith(
          statusBarColor: Colors.transparent,
          systemNavigationBarColor: Colors.transparent,
        ),
      ),
      dividerTheme: DividerThemeData(color: AppColors.borderMuted, thickness: 1),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AppColors.surfaceSolid,
        modalBarrierColor: const Color(0x66000000),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppColors.radiusCard)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        indicatorColor: AppColors.gold.withValues(alpha: 0.2),
        shadowColor: Colors.transparent,
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith((s) {
          final sel = s.contains(WidgetState.selected);
          return textTheme.labelLarge!.copyWith(
            color: sel ? AppColors.textPrimary : AppColors.textSecondary,
            fontSize: 11,
            fontWeight: sel ? FontWeight.w600 : FontWeight.w500,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((s) {
          final sel = s.contains(WidgetState.selected);
          return IconThemeData(
            color: sel ? AppColors.gold : AppColors.textSecondary,
            size: 24,
          );
        }),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          shadowColor: Colors.transparent,
          backgroundColor: AppColors.gold,
          foregroundColor: Colors.white,
          textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 15),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radiusButton),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gold,
          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.45)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radiusButton),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.72),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: BorderSide(color: AppColors.borderMuted),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: BorderSide(color: AppColors.borderMuted),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
        ),
        labelStyle: textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: const Color(0xE6252833),
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: Colors.white),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
        ),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: AppColors.gold,
        linearTrackColor: AppColors.borderMuted,
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: AppColors.gold.withValues(alpha: 0.45),
        inactiveTrackColor: AppColors.borderMuted,
        thumbColor: AppColors.gold,
        overlayColor: AppColors.gold.withValues(alpha: 0.12),
        trackHeight: 4,
      ),
    );
  }

  static ThemeData get dark {
    final colorScheme = ColorScheme.dark(
      surface: Colors.transparent,
      onSurface: WorkspaceDashboardTokens.textPrimary,
      onSurfaceVariant: WorkspaceDashboardTokens.textSecondary,
      primary: AppColors.gold,
      onPrimary: Colors.white,
      secondary: WorkspaceDashboardTokens.textSecondary,
      onSecondary: WorkspaceDashboardTokens.textPrimary,
      error: AppColors.error,
      onError: WorkspaceDashboardTokens.textPrimary,
      outline: WorkspaceDashboardTokens.outlineDark,
      surfaceContainerHighest: WorkspaceDashboardTokens.bgSecondary,
    );

    final textTheme = AppTypography.textTheme(
      onSurface: WorkspaceDashboardTokens.textPrimary,
      onSurfaceVariant: WorkspaceDashboardTokens.textSecondary,
      primary: AppColors.gold,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.transparent,
      colorScheme: colorScheme,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,
      cardTheme: CardThemeData(
        color: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusCard),
          side: const BorderSide(color: WorkspaceDashboardTokens.outlineDark),
        ),
        margin: EdgeInsets.zero,
        shadowColor: Colors.transparent,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: WorkspaceDashboardTokens.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: const IconThemeData(color: WorkspaceDashboardTokens.textPrimary),
        systemOverlayStyle: SystemUiOverlayStyle.light.copyWith(
          statusBarColor: Colors.transparent,
          systemNavigationBarColor: Colors.transparent,
        ),
      ),
      dividerTheme: DividerThemeData(
        color: WorkspaceDashboardTokens.glassBorder.withValues(alpha: 0.5),
        thickness: 1,
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: WorkspaceDashboardTokens.bgSecondary,
        modalBarrierColor: const Color(0x99000000),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppColors.radiusCard)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        indicatorColor: AppColors.gold.withValues(alpha: 0.18),
        shadowColor: Colors.transparent,
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((s) {
          final sel = s.contains(WidgetState.selected);
          return textTheme.labelLarge!.copyWith(
            color: sel ? AppColors.gold : WorkspaceDashboardTokens.textSecondary,
            fontSize: 12,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((s) {
          final sel = s.contains(WidgetState.selected);
          return IconThemeData(
            color: sel ? AppColors.gold : WorkspaceDashboardTokens.textSecondary,
            size: 22,
          );
        }),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          shadowColor: Colors.transparent,
          backgroundColor: AppColors.gold,
          foregroundColor: Colors.white,
          textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 15),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radiusButton),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.gold,
          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.55)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppColors.radiusButton),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: WorkspaceDashboardTokens.bgSecondary.withValues(alpha: 0.92),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: const BorderSide(color: WorkspaceDashboardTokens.outlineDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: const BorderSide(color: WorkspaceDashboardTokens.outlineDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          borderSide: const BorderSide(color: AppColors.gold, width: 1),
        ),
        labelStyle: textTheme.bodyMedium?.copyWith(color: WorkspaceDashboardTokens.textSecondary),
        hintStyle: textTheme.bodyMedium?.copyWith(color: WorkspaceDashboardTokens.textMuted),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: WorkspaceDashboardTokens.bgSecondary,
        contentTextStyle: textTheme.bodyMedium,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppColors.radiusButton),
          side: const BorderSide(color: WorkspaceDashboardTokens.outlineDark),
        ),
      ),
    );
  }
}
