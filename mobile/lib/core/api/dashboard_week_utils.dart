/// Alineado con `getCurrentWeekNumber` en [backend/src/dashboard/dashboard.controller.ts].
int dashboardWeekNumber(DateTime now) {
  final start = DateTime(now.year, 1, 1);
  final days = now.difference(start).inDays;
  final startWeekdayJs = start.weekday % 7;
  return ((days + startWeekdayJs + 1) / 7).ceil();
}

int dashboardYear(DateTime now) => now.year;

/// Lunes = monday … domingo = sunday (API Nest).
String dashboardDayKey(DateTime date) {
  const keys = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  final w = date.weekday;
  return keys[w - 1];
}
