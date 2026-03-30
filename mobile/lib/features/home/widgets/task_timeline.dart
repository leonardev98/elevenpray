import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../core/widgets/workspace_glass_card.dart';
import '../models/dashboard_task.dart';
import 'tag_chip.dart';

/// Timeline vertical por horas; tareas con [hourSlot] en la columna derecha.
class TaskTimeline extends StatelessWidget {
  const TaskTimeline({
    super.key,
    required this.tasks,
    required this.day,
    this.startHour = 7,
    this.endHour = 22,
    this.onAddTap,
    this.addActionColor,
  });

  final List<DashboardTask> tasks;
  final DateTime day;
  final int startHour;
  final int endHour;
  final VoidCallback? onAddTap;
  final Color? addActionColor;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat.Hm();
    final bySlot = <int, List<DashboardTask>>{};
    for (final t in tasks) {
      final slot = t.hourSlot;
      if (slot == null) continue;
      final hour = slot ~/ 60;
      if (hour < startHour || hour > endHour) continue;
      bySlot.putIfAbsent(hour, () => []).add(t);
    }

    if (bySlot.isEmpty) {
      return _EmptySlot(
        onAddTap: onAddTap,
        addActionColor: addActionColor,
        compact: false,
      );
    }

    final hours = bySlot.keys.where((h) => h >= startHour && h <= endHour).toList()..sort();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final h in hours)
          _HourRow(
            hourLabel: fmt.format(DateTime(2000, 1, 1, h, 0)),
            tasks: bySlot[h]!,
            onAddTap: onAddTap,
            addActionColor: addActionColor,
          ),
      ],
    );
  }
}

class _HourRow extends StatelessWidget {
  const _HourRow({
    required this.hourLabel,
    required this.tasks,
    this.onAddTap,
    this.addActionColor,
  });

  final String hourLabel;
  final List<DashboardTask> tasks;
  final VoidCallback? onAddTap;
  final Color? addActionColor;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 52,
            child: Padding(
              padding: const EdgeInsets.only(top: 14),
              child: Text(
                hourLabel,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: context.dashTextMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(left: 8, bottom: 10),
              child: tasks.isEmpty
                  ? _EmptySlot(
                      onAddTap: onAddTap,
                      addActionColor: addActionColor,
                      compact: false,
                    )
                  : tasks.length == 1
                      ? _TimelineTaskCard(task: tasks.first)
                      : Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            for (var i = 0; i < tasks.length; i++) ...[
                              if (i > 0) const SizedBox(width: 8),
                              Expanded(child: _TimelineTaskCard(task: tasks[i])),
                            ],
                          ],
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptySlot extends StatelessWidget {
  const _EmptySlot({this.onAddTap, this.addActionColor, this.compact = false});

  final VoidCallback? onAddTap;
  final Color? addActionColor;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: Text(
                '—',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: context.dashTextMuted,
                    ),
              ),
            ),
            TextButton(
              onPressed: onAddTap,
              style: TextButton.styleFrom(
                foregroundColor: addActionColor ?? WorkspaceDashboardTokens.uniPrimary,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('+ Add'),
            ),
          ],
        ),
      );
    }
    return WorkspaceGlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'No tienes actividades',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: context.dashTextMuted,
                  ),
            ),
          ),
          TextButton(
            onPressed: onAddTap,
            style: TextButton.styleFrom(
              foregroundColor: addActionColor ?? WorkspaceDashboardTokens.uniPrimary,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text('+ Add'),
          ),
        ],
      ),
    );
  }
}

class _TimelineTaskCard extends StatelessWidget {
  const _TimelineTaskCard({required this.task});

  final DashboardTask task;

  String _time() {
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
    return WorkspaceGlassCard(
      padding: const EdgeInsets.fromLTRB(0, 10, 8, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 3,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              color: task.leftAccentColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 13, height: 1.25),
                ),
                if (_time().isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    _time(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontSize: 10,
                          color: context.dashTextMuted,
                        ),
                  ),
                ],
                const SizedBox(height: 8),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
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
