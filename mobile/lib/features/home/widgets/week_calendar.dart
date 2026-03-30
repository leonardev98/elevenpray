import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../core/widgets/workspace_glass_card.dart';

typedef DaySelectedCallback = void Function(DateTime day);

/// Fila MO–SU con día activo en píldora.
class WeekCalendar extends StatelessWidget {
  const WeekCalendar({
    super.key,
    required this.weekStart,
    required this.selectedDay,
    required this.onSelectDay,
    required this.hasTasksOnDay,
    required this.primaryColor,
  });

  /// Lunes de la semana visible.
  final DateTime weekStart;
  final DateTime selectedDay;
  final DaySelectedCallback onSelectDay;
  final bool Function(DateTime day) hasTasksOnDay;
  final Color primaryColor;

  static DateTime mondayOfWeek(DateTime d) {
    final diff = d.weekday - DateTime.monday;
    return DateTime(d.year, d.month, d.day).subtract(Duration(days: diff));
  }

  @override
  Widget build(BuildContext context) {
    final labels = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    final today = DateTime.now();
    final todayDate = DateTime(today.year, today.month, today.day);

    return WorkspaceGlassCard(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(7, (i) {
          final day = weekStart.add(Duration(days: i));
          final dayOnly = DateTime(day.year, day.month, day.day);
          final selected = dayOnly == DateTime(selectedDay.year, selectedDay.month, selectedDay.day);
          final isToday = dayOnly == todayDate;
          final has = hasTasksOnDay(dayOnly);

          return Expanded(
            child: Material(
              type: MaterialType.transparency,
              child: InkWell(
                onTap: () => onSelectDay(dayOnly),
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        curve: Curves.easeOutCubic,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                        decoration: BoxDecoration(
                          color: selected ? primaryColor.withValues(alpha: 0.35) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: selected
                                ? primaryColor.withValues(alpha: 0.65)
                                : Colors.transparent,
                          ),
                          boxShadow: selected
                              ? [
                                  BoxShadow(
                                    color: primaryColor.withValues(alpha: 0.25),
                                    blurRadius: 12,
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          labels[i],
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: selected
                                    ? WorkspaceDashboardTokens.textPrimary
                                    : WorkspaceDashboardTokens.textSecondary,
                              ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat.d().format(day),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 12,
                              fontWeight: isToday ? FontWeight.w700 : FontWeight.w500,
                              color: isToday ? primaryColor : context.dashTextMuted,
                            ),
                      ),
                      const SizedBox(height: 4),
                      if (has)
                        Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: primaryColor.withValues(alpha: 0.85),
                          ),
                        )
                      else
                        const SizedBox(height: 4),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
