import 'package:flutter/material.dart';

import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

const Color _manana = Color(0xFFFFB3CC);
const Color _noche = Color(0xFFD4A5FF);
const Color _semanal = Color(0xFFFF6B9D);
const Color _spf = Color(0xFFFFB830);
const Color _gestion = Color(0xFF7B9FFF);

final List<DashboardStat> skincareStats = [
  const DashboardStat(
    title: 'Rutina AM',
    displayValue: 'Sí',
    icon: Icons.wb_sunny_outlined,
    variantIndex: 0,
  ),
  const DashboardStat(
    title: 'Rutina PM',
    displayValue: 'Pend.',
    icon: Icons.nightlight_outlined,
    variantIndex: 1,
  ),
  const DashboardStat(
    title: 'Productos',
    displayValue: '7',
    icon: Icons.inventory_2_outlined,
    variantIndex: 2,
  ),
  const DashboardStat(
    title: 'Streak',
    displayValue: '14 d',
    icon: Icons.local_fire_department_outlined,
    variantIndex: 3,
  ),
];

List<DashboardTask> skincareTasksForDay(DateTime day) {
  return _skinDailyTasks;
}

const List<DashboardTask> _skinDailyTasks = [
  DashboardTask(
    id: 's1',
    title: 'Rutina AM — Cleanser + Vitamin C + SPF',
    timeStart: TimeOfDay(hour: 7, minute: 0),
    timeEnd: TimeOfDay(hour: 7, minute: 15),
    tags: [
      DashboardTaskTag(label: 'Mañana', accentColor: _manana),
      DashboardTaskTag(label: 'SPF', accentColor: _spf),
    ],
    leftAccentColor: _manana,
    hourSlot: 7 * 60,
  ),
  DashboardTask(
    id: 's2',
    title: 'Aplicar retinol',
    timeStart: TimeOfDay(hour: 21, minute: 0),
    timeEnd: TimeOfDay(hour: 21, minute: 10),
    tags: [DashboardTaskTag(label: 'Noche', accentColor: _noche)],
    leftAccentColor: _noche,
    hourSlot: 21 * 60,
  ),
  DashboardTask(
    id: 's3',
    title: 'Mascarilla hidratante',
    timeStart: TimeOfDay(hour: 20, minute: 0),
    timeEnd: TimeOfDay(hour: 20, minute: 20),
    tags: [DashboardTaskTag(label: 'Semanal', accentColor: _semanal)],
    leftAccentColor: _semanal,
    hourSlot: 20 * 60,
  ),
  DashboardTask(
    id: 's4',
    title: 'Revisar stock productos',
    flexibleTimeLabel: 'flexible',
    tags: [DashboardTaskTag(label: 'Gestión', accentColor: _gestion)],
    leftAccentColor: _gestion,
    hourSlot: null,
  ),
];

bool skincareHasTasksOnDay(DateTime day) => true;

Color skincareStatVariantColor(int index) {
  switch (index % 4) {
    case 0:
      return WorkspaceDashboardTokens.skinPrimary;
    case 1:
      return WorkspaceDashboardTokens.skinSecondary;
    case 2:
      return WorkspaceDashboardTokens.statusOngoing;
    case 3:
    default:
      return WorkspaceDashboardTokens.skinAccent;
  }
}
