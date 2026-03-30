import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'workspace_dashboard_tokens.dart';

/// Tipografía local del dashboard (Sora + DM Sans).
ThemeData workspaceDashboardTheme() {
  final display = GoogleFonts.sora(
    color: WorkspaceDashboardTokens.textPrimary,
    fontWeight: FontWeight.w800,
    height: 1.12,
  );
  final body = GoogleFonts.dmSans(
    color: WorkspaceDashboardTokens.textPrimary,
    fontWeight: FontWeight.w400,
    height: 1.45,
  );
  final bodyMedium = GoogleFonts.dmSans(
    color: WorkspaceDashboardTokens.textPrimary,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: Colors.transparent,
    textTheme: TextTheme(
      displaySmall: display.copyWith(fontSize: 26),
      headlineMedium: GoogleFonts.sora(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: WorkspaceDashboardTokens.textPrimary,
        height: 1.25,
      ),
      titleLarge: GoogleFonts.sora(
        fontSize: 17,
        fontWeight: FontWeight.w700,
        color: WorkspaceDashboardTokens.textPrimary,
      ),
      titleMedium: GoogleFonts.sora(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: WorkspaceDashboardTokens.textPrimary,
      ),
      bodyLarge: body.copyWith(fontSize: 16),
      bodyMedium: body.copyWith(fontSize: 14),
      bodySmall: GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: WorkspaceDashboardTokens.textSecondary,
        height: 1.4,
      ),
      labelLarge: bodyMedium.copyWith(fontSize: 13),
      labelSmall: GoogleFonts.dmSans(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        color: WorkspaceDashboardTokens.textSecondary,
      ),
    ),
  );
}
