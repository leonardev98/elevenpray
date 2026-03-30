import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/workspace_dashboard_tokens.dart';

class MitsyyCard extends StatelessWidget {
  const MitsyyCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(18),
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final r = BorderRadius.circular(AppColors.radiusCard);

    final Color fill;
    final Color borderColor;
    final List<BoxShadow> shadows;

    if (isDark) {
      fill = WorkspaceDashboardTokens.bgSecondary;
      borderColor = WorkspaceDashboardTokens.outlineDark;
      shadows = const [];
    } else {
      fill = WorkspaceDashboardTokens.surfaceCardLight;
      borderColor = WorkspaceDashboardTokens.outlineLight;
      shadows = WorkspaceDashboardTokens.shadowCardLight;
    }

    final card = ClipRRect(
      borderRadius: r,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: fill,
          borderRadius: r,
          border: Border.all(color: borderColor, width: 1),
          boxShadow: shadows,
        ),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );

    if (onTap == null) return card;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: r,
        splashColor: AppColors.gold.withValues(alpha: 0.14),
        highlightColor: AppColors.gold.withValues(alpha: 0.08),
        child: card,
      ),
    );
  }
}
