import 'package:flutter/material.dart';

import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';

class TagChip extends StatelessWidget {
  const TagChip({super.key, required this.label, required this.accentColor});

  final String label;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final bg = Color.alphaBlend(accentColor.withValues(alpha: dark ? 0.18 : 0.12), context.dashCardSurface);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(WorkspaceDashboardTokens.radiusChip),
        border: Border.all(color: accentColor.withValues(alpha: 0.35)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: context.dashTextPrimary.withValues(alpha: 0.92),
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
