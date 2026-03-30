import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/icons/workspace_icon.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_card.dart';
import '../../../models/workspace.dart';

class WorkspaceSummaryCard extends StatelessWidget {
  const WorkspaceSummaryCard({super.key, required this.workspace});

  final Workspace workspace;

  void _open(BuildContext context) {
    if (workspace.typeSlug == 'skincare') {
      context.go('/skincare');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Pronto: ${workspace.name}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final s = workspace.summary;
    final amFrac = workspace.amStepsTotal > 0 ? workspace.amStepsDone / workspace.amStepsTotal : 0.0;
    final icon = workspaceIconFromKey(workspace.iconKey);

    return MitsyyCard(
      onTap: () => _open(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 30, color: AppColors.gold.withValues(alpha: 0.92)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  workspace.name,
                  style: theme.textTheme.headlineSmall?.copyWith(fontSize: 20),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (s.streakDays > 7)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: AppColors.gold.withValues(alpha: 0.12),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.flame, size: 14, color: AppColors.gold),
                      const SizedBox(width: 4),
                      Text(
                        '${s.streakDays}d',
                        style: theme.textTheme.labelSmall?.copyWith(color: AppColors.gold),
                      ),
                    ],
                  ),
                )
              else if (s.streakDays > 0)
                Text(
                  '${s.streakDays}d',
                  style: theme.textTheme.labelSmall?.copyWith(color: AppColors.gold),
                ),
            ],
          ),
          if (s.todayStatus != null) ...[
            const SizedBox(height: 10),
            Text(
              s.todayStatus!,
              style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            ),
          ],
          if (s.alertLabel != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.alertAmber.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.alertAmber.withValues(alpha: 0.35)),
              ),
              child: Text(
                s.alertLabel!,
                style: theme.textTheme.labelMedium?.copyWith(color: AppColors.alertAmber),
              ),
            ),
          ],
          if (s.nextActionLabel != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    s.nextActionLabel!,
                    style: theme.textTheme.labelLarge?.copyWith(color: AppColors.gold.withValues(alpha: 0.95)),
                  ),
                ),
                Icon(Icons.arrow_forward_rounded, size: 18, color: AppColors.gold.withValues(alpha: 0.8)),
              ],
            ),
          ],
          const SizedBox(height: 14),
          Text(
            '${workspace.amStepsDone}/${workspace.amStepsTotal} pasos AM',
            style: theme.textTheme.labelSmall,
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: amFrac.clamp(0.0, 1.0),
              minHeight: 4,
              backgroundColor: AppColors.borderMuted,
              color: AppColors.gold,
            ),
          ),
        ],
      ),
    );
  }
}
