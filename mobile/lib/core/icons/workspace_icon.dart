import 'package:flutter/widgets.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// Claves usadas en mocks / modelos → iconos Lucide.
IconData workspaceIconFromKey(String key) {
  switch (key) {
    case 'sparkles':
      return LucideIcons.sparkles;
    case 'book':
      return LucideIcons.bookOpen;
    case 'dumbbell':
      return LucideIcons.dumbbell;
    case 'salad':
      return LucideIcons.salad;
    case 'wind':
      return LucideIcons.wind;
    case 'globe':
      return LucideIcons.globe;
    case 'book_marked':
      return LucideIcons.bookMarked;
    case 'laptop':
      return LucideIcons.laptop;
    case 'briefcase':
      return LucideIcons.briefcase;
    case 'rocket':
      return LucideIcons.rocket;
    default:
      return LucideIcons.layoutGrid;
  }
}

/// Icono según tipo de workspace del API (Nest registry).
IconData workspaceIconForWorkspaceType(String type) {
  switch (type) {
    case 'skincare':
      return LucideIcons.sparkles;
    case 'study':
    case 'university':
      return LucideIcons.bookOpen;
    case 'work':
      return LucideIcons.briefcase;
    case 'fitness':
      return LucideIcons.dumbbell;
    case 'nutrition':
      return LucideIcons.salad;
    case 'sleep':
      return LucideIcons.moon;
    case 'mental_health':
      return LucideIcons.wind;
    case 'general':
      return LucideIcons.layoutGrid;
    default:
      return LucideIcons.layoutGrid;
  }
}
