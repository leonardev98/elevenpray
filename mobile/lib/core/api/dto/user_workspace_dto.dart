class UserWorkspaceDto {
  const UserWorkspaceDto({
    required this.id,
    required this.name,
    required this.workspaceType,
    this.subtypeLabel,
    this.sortOrder = 0,
  });

  final String id;
  final String name;
  final String workspaceType;
  final String? subtypeLabel;
  final int sortOrder;

  factory UserWorkspaceDto.fromJson(Map<String, dynamic> json) {
    final sub = json['workspaceSubtype'] as Map<String, dynamic>?;
    return UserWorkspaceDto(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      workspaceType: json['workspaceType'] as String? ?? 'general',
      subtypeLabel: sub?['label'] as String?,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
    );
  }
}
