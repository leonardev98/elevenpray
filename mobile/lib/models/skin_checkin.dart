class SkinCheckin {
  const SkinCheckin({
    required this.id,
    required this.workspaceId,
    required this.date,
    required this.hydration,
    required this.redness,
    required this.brightness,
    this.photoUrl,
    this.note,
  });

  final String id;
  final String workspaceId;
  final DateTime date;
  final double hydration;
  final double redness;
  final double brightness;
  final String? photoUrl;
  final String? note;
}
