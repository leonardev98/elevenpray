import 'package:flutter/material.dart';

enum WorkspaceMode { universidad, skincare, developer, generic }

/// Etiqueta mostrada en chips (texto + color de acento).
class DashboardTaskTag {
  const DashboardTaskTag({required this.label, required this.accentColor});

  final String label;
  final Color accentColor;
}

class DashboardTask {
  const DashboardTask({
    required this.id,
    required this.title,
    this.timeStart,
    this.timeEnd,
    this.flexibleTimeLabel,
    required this.tags,
    required this.leftAccentColor,
    this.hourSlot,
  });

  final String id;
  final String title;
  final TimeOfDay? timeStart;
  final TimeOfDay? timeEnd;
  /// Cuando no hay rango horario fijo (ej. "flexible").
  final String? flexibleTimeLabel;
  final List<DashboardTaskTag> tags;
  final Color leftAccentColor;
  /// Hora de inicio en minutos desde medianoche (para timeline).
  final int? hourSlot;
}

class DashboardStat {
  const DashboardStat({
    required this.title,
    required this.displayValue,
    required this.icon,
    required this.variantIndex,
  });

  final String title;
  final String displayValue;
  final IconData icon;
  final int variantIndex;
}
