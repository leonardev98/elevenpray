import 'package:flutter/material.dart';

import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

/// Colores por categoría (prompt).
const Color _urgente = Color(0xFFFF6B6B);
const Color _clase = Color(0xFF4F7FFF);
const Color _examen = Color(0xFF7B61FF);
const Color _proyecto = Color(0xFF00D4AA);

final List<DashboardStat> universidadStats = [
  const DashboardStat(
    title: 'Completadas',
    displayValue: '12',
    icon: Icons.check_circle_outline_rounded,
    variantIndex: 0,
  ),
  const DashboardStat(
    title: 'Pendientes',
    displayValue: '8',
    icon: Icons.radio_button_unchecked_rounded,
    variantIndex: 1,
  ),
  const DashboardStat(
    title: 'Canceladas',
    displayValue: '2',
    icon: Icons.cancel_outlined,
    variantIndex: 2,
  ),
  const DashboardStat(
    title: 'En curso',
    displayValue: '3',
    icon: Icons.timelapse_rounded,
    variantIndex: 3,
  ),
];

List<DashboardTask> universidadTasksForDay(DateTime day) {
  // Misma lista demo todos los días laborables; vacío fin de semana opcional.
  final wd = day.weekday;
  if (wd == DateTime.saturday || wd == DateTime.sunday) {
    return const [];
  }
  return _uniWeekdayTasks;
}

const List<DashboardTask> _uniWeekdayTasks = [
  DashboardTask(
    id: 'u1',
    title: 'Entregar ensayo Literatura',
    timeStart: TimeOfDay(hour: 8, minute: 0),
    timeEnd: TimeOfDay(hour: 9, minute: 0),
    tags: [
      DashboardTaskTag(label: 'Urgente', accentColor: _urgente),
      DashboardTaskTag(label: 'Proyecto', accentColor: _proyecto),
    ],
    leftAccentColor: _urgente,
    hourSlot: 8 * 60,
  ),
  DashboardTask(
    id: 'u2',
    title: 'Clase de Cálculo II',
    timeStart: TimeOfDay(hour: 10, minute: 0),
    timeEnd: TimeOfDay(hour: 11, minute: 30),
    tags: [DashboardTaskTag(label: 'Clase', accentColor: _clase)],
    leftAccentColor: _clase,
    hourSlot: 10 * 60,
  ),
  DashboardTask(
    id: 'u3',
    title: 'Estudiar para parcial Química',
    timeStart: TimeOfDay(hour: 14, minute: 0),
    timeEnd: TimeOfDay(hour: 16, minute: 0),
    tags: [
      DashboardTaskTag(label: 'Examen', accentColor: _examen),
      DashboardTaskTag(label: 'Urgente', accentColor: _urgente),
    ],
    leftAccentColor: _examen,
    hourSlot: 14 * 60,
  ),
  DashboardTask(
    id: 'u4',
    title: 'Reunión grupo trabajo',
    timeStart: TimeOfDay(hour: 17, minute: 0),
    timeEnd: TimeOfDay(hour: 18, minute: 0),
    tags: [DashboardTaskTag(label: 'Proyecto', accentColor: _proyecto)],
    leftAccentColor: _proyecto,
    hourSlot: 17 * 60,
  ),
];

/// Días con al menos una tarea (lun–vie) para puntos en week calendar.
bool universidadHasTasksOnDay(DateTime day) {
  final wd = day.weekday;
  return wd != DateTime.saturday && wd != DateTime.sunday;
}

Color universidadStatVariantColor(int index) {
  switch (index % 4) {
    case 0:
      return WorkspaceDashboardTokens.uniPrimary;
    case 1:
      return WorkspaceDashboardTokens.statusPending;
    case 2:
      return WorkspaceDashboardTokens.statusCancelled;
    case 3:
    default:
      return WorkspaceDashboardTokens.statusCompleted;
  }
}
