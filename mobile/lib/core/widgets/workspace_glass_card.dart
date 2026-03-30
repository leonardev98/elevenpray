import 'package:flutter/material.dart';

import '../theme/dashboard_theme_ext.dart';
import '../theme/workspace_dashboard_tokens.dart';

enum WorkspaceGlassTint { none, universidad, skincare }

/// Card plana (sin blur): relleno sólido y borde fino estilo Instagram.
class WorkspaceGlassCard extends StatelessWidget {
  const WorkspaceGlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.blurSigma = 0,
    this.tint = WorkspaceGlassTint.none,
    this.borderColor,
    this.extraShadows = const [],
    this.onTap,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final double blurSigma;
  final WorkspaceGlassTint tint;
  final Color? borderColor;
  final List<BoxShadow> extraShadows;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final r = borderRadius ?? BorderRadius.circular(WorkspaceDashboardTokens.radiusGlassCard);
    final border = borderColor ??
        (context.isDarkDashboard
            ? WorkspaceDashboardTokens.outlineDark
            : WorkspaceDashboardTokens.outlineLight);
    final dark = context.isDarkDashboard;
    final base = context.dashCardSurface;

    Color fill = switch (tint) {
      WorkspaceGlassTint.universidad => Color.alphaBlend(
          WorkspaceDashboardTokens.uniPrimary.withValues(alpha: dark ? 0.12 : 0.08),
          base,
        ),
      WorkspaceGlassTint.skincare => Color.alphaBlend(
          WorkspaceDashboardTokens.skinPrimary.withValues(alpha: dark ? 0.12 : 0.08),
          base,
        ),
      WorkspaceGlassTint.none => base,
    };

    final shadows = <BoxShadow>[
      if (!dark) ...WorkspaceDashboardTokens.shadowCardLight,
      ...extraShadows,
    ];

    final decorated = Container(
      decoration: BoxDecoration(
        color: fill,
        borderRadius: r,
        border: Border.all(color: border, width: 1),
        boxShadow: shadows,
      ),
      child: padding != null ? Padding(padding: padding!, child: child) : child,
    );

    Widget clip = ClipRRect(
      borderRadius: r,
      clipBehavior: Clip.antiAlias,
      child: decorated,
    );

    if (onTap != null) {
      clip = Material(
        type: MaterialType.transparency,
        child: InkWell(
          onTap: onTap,
          borderRadius: r,
          splashColor: dark ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04),
          highlightColor: dark ? Colors.white.withValues(alpha: 0.03) : Colors.black.withValues(alpha: 0.02),
          child: clip,
        ),
      );
    }

    return clip;
  }
}
