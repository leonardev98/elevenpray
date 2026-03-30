import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/workspace_dashboard_tokens.dart';

/// Panel con superficie sólida y borde fino (sin blur).
class MitsyyGlassSurface extends StatelessWidget {
  const MitsyyGlassSurface({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.blurSigma = 0,
    this.fillTopAlpha = 0.78,
    this.fillBottomAlpha = 0.52,
    this.borderColor,
    this.borderWidth = 1,
    this.includeDecorationShadow = true,
    this.useBackdropBlur = false,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final double blurSigma;
  final double fillTopAlpha;
  final double fillBottomAlpha;
  final Color? borderColor;
  final double borderWidth;
  final bool includeDecorationShadow;
  final bool useBackdropBlur;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final r = borderRadius ?? BorderRadius.circular(AppColors.radiusCard);
    final border = borderColor ??
        (isDark ? WorkspaceDashboardTokens.outlineDark : WorkspaceDashboardTokens.outlineLight);

    final fill = isDark ? WorkspaceDashboardTokens.bgSecondary : AppColors.surfaceSolid;

    final content = padding != null ? Padding(padding: padding!, child: child) : child;

    return ClipRRect(
      borderRadius: r,
      clipBehavior: Clip.antiAlias,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: fill,
          borderRadius: r,
          border: Border.all(color: border, width: borderWidth),
          boxShadow: includeDecorationShadow && !isDark
              ? WorkspaceDashboardTokens.shadowCardLight
              : null,
        ),
        child: content,
      ),
    );
  }
}
