import 'package:flutter/material.dart';

import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

const Color _deep = Color(0xFF16A34A);
const Color _review = Color(0xFF22C55E);
const Color _meet = Color(0xFF4ADE80);
const Color _focus = Color(0xFF86EFAC);

final List<DashboardStat> developerStats = [
  const DashboardStat(
    title: 'PRs abiertos',
    displayValue: '3',
    icon: Icons.merge_type_rounded,
    variantIndex: 0,
  ),
  const DashboardStat(
    title: 'Issues',
    displayValue: '5',
    icon: Icons.bug_report_outlined,
    variantIndex: 1,
  ),
  const DashboardStat(
    title: 'Deep work',
    displayValue: '2h',
    icon: Icons.timer_outlined,
    variantIndex: 2,
  ),
  const DashboardStat(
    title: 'Snippets',
    displayValue: '12',
    icon: Icons.code_rounded,
    variantIndex: 3,
  ),
];

List<DashboardTask> developerTasksForDay(DateTime day) {
  final wd = day.weekday;
  if (wd == DateTime.saturday || wd == DateTime.sunday) {
    return const [];
  }
  return _devWeekdayTasks;
}

const List<DashboardTask> _devWeekdayTasks = [
  DashboardTask(
    id: 'd1',
    title: 'Standup + revisión de sprint',
    timeStart: TimeOfDay(hour: 9, minute: 30),
    timeEnd: TimeOfDay(hour: 10, minute: 0),
    tags: [
      DashboardTaskTag(label: 'Meet', accentColor: _meet),
    ],
    leftAccentColor: _meet,
    hourSlot: 9 * 60 + 30,
  ),
  DashboardTask(
    id: 'd2',
    title: 'Implementar feature: selector de workspaces',
    timeStart: TimeOfDay(hour: 10, minute: 30),
    timeEnd: TimeOfDay(hour: 13, minute: 0),
    tags: [
      DashboardTaskTag(label: 'Deep work', accentColor: _focus),
      DashboardTaskTag(label: 'Flutter', accentColor: _deep),
    ],
    leftAccentColor: _deep,
    hourSlot: 10 * 60 + 30,
  ),
  DashboardTask(
    id: 'd3',
    title: 'Code review PR #142',
    timeStart: TimeOfDay(hour: 15, minute: 0),
    timeEnd: TimeOfDay(hour: 16, minute: 0),
    tags: [DashboardTaskTag(label: 'Review', accentColor: _review)],
    leftAccentColor: _review,
    hourSlot: 15 * 60,
  ),
  DashboardTask(
    id: 'd4',
    title: 'Documentar API mock',
    flexibleTimeLabel: 'flexible',
    tags: [DashboardTaskTag(label: 'Docs', accentColor: _focus)],
    leftAccentColor: _focus,
    hourSlot: null,
  ),
];

bool developerHasTasksOnDay(DateTime day) {
  final wd = day.weekday;
  return wd != DateTime.saturday && wd != DateTime.sunday;
}

Color developerStatVariantColor(int index) {
  switch (index % 4) {
    case 0:
      return WorkspaceDashboardTokens.devPrimary;
    case 1:
      return WorkspaceDashboardTokens.statusPending;
    case 2:
      return WorkspaceDashboardTokens.statusOngoing;
    case 3:
    default:
      return WorkspaceDashboardTokens.devSecondary;
  }
}
