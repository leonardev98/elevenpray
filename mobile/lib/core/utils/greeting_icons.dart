import 'package:flutter/widgets.dart';
import 'package:lucide_icons/lucide_icons.dart';

IconData greetingIconForHour(int hour) {
  if (hour < 12) return LucideIcons.sun;
  if (hour < 19) return LucideIcons.cloudSun;
  return LucideIcons.moon;
}
