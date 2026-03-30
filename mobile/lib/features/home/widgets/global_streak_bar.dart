import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_glass_surface.dart';

class GlobalStreakBar extends StatelessWidget {
  const GlobalStreakBar({super.key, required this.days, this.maxDays = 21});

  final int days;
  final int maxDays;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final p = (days / maxDays).clamp(0.0, 1.0);

    return FadeInUp(
      duration: const Duration(milliseconds: 260),
      child: MitsyyGlassSurface(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(LucideIcons.flame, size: 18, color: AppColors.gold.withValues(alpha: 0.95)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '$days días de racha global · Tu mejor semana',
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 13),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: p,
                minHeight: 4,
                backgroundColor: AppColors.borderMuted,
                color: AppColors.gold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
