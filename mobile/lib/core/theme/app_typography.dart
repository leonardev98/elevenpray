import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Tipografía unificada (Plus Jakarta Sans) para UI moderna.
abstract final class AppTypography {
  static TextTheme textTheme({
    required Color onSurface,
    required Color onSurfaceVariant,
    required Color primary,
  }) {
    final display = GoogleFonts.plusJakartaSans(
      fontWeight: FontWeight.w700,
      color: onSurface,
      letterSpacing: -0.5,
      height: 1.12,
    );
    final title = GoogleFonts.plusJakartaSans(
      fontWeight: FontWeight.w600,
      color: onSurface,
      letterSpacing: -0.2,
    );
    final body = GoogleFonts.plusJakartaSans(
      fontWeight: FontWeight.w400,
      color: onSurface,
      height: 1.5,
    );
    final bodyMedium = GoogleFonts.plusJakartaSans(
      fontWeight: FontWeight.w500,
      color: onSurface,
      height: 1.45,
    );

    return TextTheme(
      displayLarge: display.copyWith(fontSize: 40),
      displayMedium: display.copyWith(fontSize: 32, color: primary),
      displaySmall: display.copyWith(fontSize: 26),
      headlineLarge: display.copyWith(fontSize: 24),
      headlineMedium: title.copyWith(fontSize: 20, height: 1.25),
      headlineSmall: title.copyWith(fontSize: 18, height: 1.3),
      titleLarge: title.copyWith(fontSize: 17, height: 1.35),
      titleMedium: title.copyWith(fontSize: 16, height: 1.35),
      titleSmall: title.copyWith(fontSize: 14, height: 1.35),
      bodyLarge: body.copyWith(fontSize: 16),
      bodyMedium: body.copyWith(fontSize: 14),
      bodySmall: body.copyWith(
        fontSize: 12,
        height: 1.4,
        color: onSurfaceVariant,
      ),
      labelLarge: bodyMedium.copyWith(fontSize: 13, letterSpacing: 0.1),
      labelMedium: body.copyWith(fontSize: 12, color: onSurfaceVariant),
      labelSmall: GoogleFonts.plusJakartaSans(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: onSurfaceVariant,
        letterSpacing: 0.2,
      ),
    );
  }
}
