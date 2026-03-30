/// Claves alineadas con el backend (`monday` … `sunday`).
const List<String> kRoutineDayKeys = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/// Hoy en clave inglés minúscula (lunes → monday). Dart: weekday 1 = lunes, 7 = domingo.
String routineTodayDayKey() {
  return kRoutineDayKeys[DateTime.now().weekday - 1];
}
