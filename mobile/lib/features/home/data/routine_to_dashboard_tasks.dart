import 'package:flutter/material.dart';

import '../../../core/api/dto/dashboard_week_dto.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

TimeOfDay? parseRoutineTime(String? raw) {
  if (raw == null || raw.trim().isEmpty) return null;
  final p = raw.trim().split(RegExp(r'[:h]'));
  if (p.length < 2) return null;
  final h = int.tryParse(p[0]);
  final m = int.tryParse(p[1]);
  if (h == null || m == null) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return TimeOfDay(hour: h, minute: m);
}

int? minutesSinceMidnight(TimeOfDay? t) {
  if (t == null) return null;
  return t.hour * 60 + t.minute;
}

/// Convierte el día de rutina del API en tareas para la UI del home.
List<DashboardTask> routineDayToTasks(
  DashboardRoutineDayDto day,
  Color accent,
) {
  final out = <DashboardTask>[];
  for (final g in day.groups) {
    final slotTime = parseRoutineTime(g.time);
    final hourSlot = minutesSinceMidnight(slotTime);
    for (final item in g.items) {
      if (item.type == 'heading') continue;
      final title = item.content.trim();
      if (title.isEmpty) continue;
      final tagLabel = g.title.trim().isEmpty ? 'Rutina' : g.title.trim();
      out.add(
        DashboardTask(
          id: '${day.dayKey}-${item.id}',
          title: title,
          timeStart: slotTime,
          timeEnd: null,
          flexibleTimeLabel: slotTime == null ? 'flexible' : null,
          tags: [
            DashboardTaskTag(label: tagLabel, accentColor: accent.withValues(alpha: 0.95)),
          ],
          leftAccentColor: accent,
          hourSlot: hourSlot,
        ),
      );
    }
  }
  return out;
}

List<DashboardStat> statsFromRoutineSummary({
  required int itemCount,
  required int groupCount,
  required String workspaceTitle,
}) {
  return [
    DashboardStat(
      title: 'Ítems hoy',
      displayValue: '$itemCount',
      icon: Icons.checklist_rounded,
      variantIndex: 0,
    ),
    DashboardStat(
      title: 'Bloques',
      displayValue: '$groupCount',
      icon: Icons.view_agenda_outlined,
      variantIndex: 1,
    ),
    DashboardStat(
      title: 'Espacio',
      displayValue: workspaceTitle.length > 10 ? '${workspaceTitle.substring(0, 8)}…' : workspaceTitle,
      icon: Icons.hub_outlined,
      variantIndex: 2,
    ),
    DashboardStat(
      title: 'Estado',
      displayValue: itemCount > 0 ? 'Activo' : 'Vacío',
      icon: Icons.bolt_outlined,
      variantIndex: 3,
    ),
  ];
}

Color statColorForIndex(int i) {
  switch (i % 4) {
    case 0:
      return WorkspaceDashboardTokens.uniPrimary;
    case 1:
      return WorkspaceDashboardTokens.statusPending;
    case 2:
      return WorkspaceDashboardTokens.statusOngoing;
    case 3:
    default:
      return WorkspaceDashboardTokens.statusCompleted;
  }
}
