/// Tipos alineados con `routine_templates` del backend (JSON `days` → grupos AM/PM).

class DayItem {
  const DayItem({
    required this.id,
    required this.type,
    required this.content,
    this.productId,
    this.stepType,
    this.instructions,
    this.durationSeconds,
  });

  final String id;
  final String type;
  final String content;
  final String? productId;
  final String? stepType;
  final String? instructions;
  final int? durationSeconds;

  factory DayItem.fromJson(Map<String, dynamic> json) {
    return DayItem(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'list',
      content: json['content'] as String? ?? '',
      productId: json['productId'] as String?,
      stepType: json['stepType'] as String?,
      instructions: json['instructions'] as String?,
      durationSeconds: json['durationSeconds'] as int?,
    );
  }
}

class RoutineDayGroup {
  const RoutineDayGroup({
    required this.id,
    required this.title,
    this.slot,
    required this.items,
  });

  final String id;
  final String title;
  final String? slot;
  final List<DayItem> items;

  factory RoutineDayGroup.fromJson(Map<String, dynamic> json) {
    final raw = json['items'] as List<dynamic>? ?? [];
    return RoutineDayGroup(
      id: json['id'] as String? ?? 'g',
      title: json['title'] as String? ?? '',
      slot: json['slot'] as String?,
      items: raw.map((e) => DayItem.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class DayContent {
  const DayContent({this.groups});

  final List<RoutineDayGroup>? groups;

  factory DayContent.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const DayContent();
    final g = json['groups'] as List<dynamic>?;
    if (g == null) return const DayContent();
    return DayContent(
      groups: g.map((e) => RoutineDayGroup.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class RoutineTemplate {
  const RoutineTemplate({
    required this.id,
    required this.workspaceId,
    required this.name,
    required this.days,
  });

  final String id;
  final String workspaceId;
  final String name;
  final Map<String, DayContent> days;

  factory RoutineTemplate.fromJson(Map<String, dynamic> json) {
    final rawDays = json['days'] as Map<String, dynamic>? ?? {};
    final days = <String, DayContent>{};
    for (final e in rawDays.entries) {
      days[e.key] = DayContent.fromJson(e.value as Map<String, dynamic>?);
    }
    return RoutineTemplate(
      id: json['id'] as String,
      workspaceId: json['workspaceId'] as String? ?? json['workspace_id'] as String? ?? '',
      name: json['weekLabel'] as String? ?? json['name'] as String? ?? 'Rutina',
      days: days,
    );
  }
}
