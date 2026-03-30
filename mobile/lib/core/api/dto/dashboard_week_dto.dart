class DashboardRoutineGroupDto {
  const DashboardRoutineGroupDto({
    required this.id,
    required this.title,
    this.time,
    required this.items,
  });

  final String id;
  final String title;
  final String? time;
  final List<RoutineDayItemDto> items;

  factory DashboardRoutineGroupDto.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return DashboardRoutineGroupDto(
      id: json['id'] as String? ?? 'g',
      title: json['title'] as String? ?? '',
      time: json['time'] as String?,
      items: rawItems.map((e) => RoutineDayItemDto.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class RoutineDayItemDto {
  const RoutineDayItemDto({
    required this.id,
    required this.type,
    required this.content,
  });

  final String id;
  final String type;
  final String content;

  factory RoutineDayItemDto.fromJson(Map<String, dynamic> json) {
    return RoutineDayItemDto(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'text',
      content: json['content'] as String? ?? '',
    );
  }
}

class DashboardRoutineDayDto {
  const DashboardRoutineDayDto({
    required this.workspaceId,
    required this.workspaceTitle,
    required this.dayKey,
    required this.groups,
  });

  final String workspaceId;
  final String workspaceTitle;
  final String dayKey;
  final List<DashboardRoutineGroupDto> groups;

  factory DashboardRoutineDayDto.fromJson(Map<String, dynamic> json) {
    final rawGroups = json['groups'] as List<dynamic>? ?? [];
    return DashboardRoutineDayDto(
      workspaceId: json['workspaceId'] as String,
      workspaceTitle: json['workspaceTitle'] as String? ?? '',
      dayKey: json['dayKey'] as String? ?? 'monday',
      groups: rawGroups.map((e) => DashboardRoutineGroupDto.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

class DashboardWeekDto {
  const DashboardWeekDto({
    required this.year,
    required this.weekNumber,
    required this.routineDays,
  });

  final int year;
  final int weekNumber;
  final List<DashboardRoutineDayDto> routineDays;

  factory DashboardWeekDto.fromJson(Map<String, dynamic> json) {
    final raw = json['routineDays'] as List<dynamic>? ?? [];
    return DashboardWeekDto(
      year: (json['year'] as num?)?.toInt() ?? DateTime.now().year,
      weekNumber: (json['weekNumber'] as num?)?.toInt() ?? 1,
      routineDays: raw.map((e) => DashboardRoutineDayDto.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}
