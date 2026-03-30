import 'package:flutter/material.dart';

import '../theme/workspace_dashboard_tokens.dart';

/// Fondo plano (sin gradientes ni decoración), estilo Instagram / TikTok.
class MitsyyAppBackground extends StatelessWidget {
  const MitsyyAppBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isDark ? WorkspaceDashboardTokens.bgPrimary : WorkspaceDashboardTokens.canvasLight;

    return ColoredBox(
      color: color,
      child: child,
    );
  }
}
