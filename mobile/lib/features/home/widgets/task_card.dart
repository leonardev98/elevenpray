import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../core/widgets/workspace_glass_card.dart';
import '../models/dashboard_task.dart';
import 'tag_chip.dart';

class TaskCard extends StatelessWidget {
  const TaskCard({super.key, required this.task});

  final DashboardTask task;

  String _timeLabel() {
    if (task.flexibleTimeLabel != null) return task.flexibleTimeLabel!;
    if (task.timeStart != null && task.timeEnd != null) {
      final fmt = DateFormat.Hm();
      final d = DateTime(2000, 1, 1);
      final s = DateTime(d.year, d.month, d.day, task.timeStart!.hour, task.timeStart!.minute);
      final e = DateTime(d.year, d.month, d.day, task.timeEnd!.hour, task.timeEnd!.minute);
      return '${fmt.format(s)} – ${fmt.format(e)}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return WorkspaceGlassCard(
      padding: const EdgeInsets.fromLTRB(0, 12, 10, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 3,
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: task.leftAccentColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        task.title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontSize: 15,
                          height: 1.3,
                        ),
                      ),
                    ),
                    PopupMenuButton<String>(
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                      color: context.isDarkDashboard
                          ? WorkspaceDashboardTokens.bgSecondary.withValues(alpha: 0.95)
                          : AppColors.surfaceSolid.withValues(alpha: 0.98),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(color: context.dashGlassBorder),
                      ),
                      icon: Icon(
                        Icons.more_vert_rounded,
                        size: 20,
                        color: context.dashTextSecondary,
                      ),
                      onSelected: (_) {},
                      itemBuilder: (context) => [
                        const PopupMenuItem(value: 'edit', child: Text('Editar')),
                        const PopupMenuItem(value: 'done', child: Text('Hecho')),
                      ],
                    ),
                  ],
                ),
                if (_timeLabel().isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    _timeLabel(),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: context.dashTextMuted,
                      fontSize: 12,
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: task.tags.map((t) => TagChip(label: t.label, accentColor: t.accentColor)).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
