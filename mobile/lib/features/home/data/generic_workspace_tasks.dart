import 'package:flutter/material.dart';

import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

const Color _habit = Color(0xFF8B5CF6);
const Color _goal = Color(0xFFA78BFA);
const Color _note = Color(0xFFC4B5FD);

final List<DashboardStat> genericWorkspaceStats = [
  const DashboardStat(
    title: 'Hoy',
    displayValue: '4',
    icon: Icons.today_outlined,
    variantIndex: 0,
  ),
  const DashboardStat(
    title: 'Esta semana',
    displayValue: '18',
    icon: Icons.calendar_view_week_rounded,
    variantIndex: 1,
  ),
  const DashboardStat(
    title: 'Racha',
    displayValue: '6 d',
    icon: Icons.local_fire_department_outlined,
    variantIndex: 2,
  ),
  const DashboardStat(
    title: 'Notas',
    displayValue: '9',
    icon: Icons.sticky_note_2_outlined,
    variantIndex: 3,
  ),
];

List<DashboardTask> genericTasksForDay(DateTime day) => _genericDaily;

const List<DashboardTask> _genericDaily = [
  DashboardTask(
    id: 'g1',
    title: 'Bloque de enfoque — objetivo del día',
    timeStart: TimeOfDay(hour: 8, minute: 0),
    timeEnd: TimeOfDay(hour: 9, minute: 0),
    tags: [DashboardTaskTag(label: 'Meta', accentColor: _goal)],
    leftAccentColor: _goal,
    hourSlot: 8 * 60,
  ),
  DashboardTask(
    id: 'g2',
    title: 'Registrar progreso y notas rápidas',
    flexibleTimeLabel: 'flexible',
    tags: [
      DashboardTaskTag(label: 'Hábito', accentColor: _habit),
      DashboardTaskTag(label: 'Notas', accentColor: _note),
    ],
    leftAccentColor: _habit,
    hourSlot: null,
  ),
];

bool genericHasTasksOnDay(DateTime day) => true;

Color genericStatVariantColor(int index) {
  switch (index % 4) {
    case 0:
      return WorkspaceDashboardTokens.genericPrimary;
    case 1:
      return WorkspaceDashboardTokens.genericSecondary;
    case 2:
      return WorkspaceDashboardTokens.statusOngoing;
    case 3:
    default:
      return WorkspaceDashboardTokens.statusPending;
  }
}
