class ProgressPhoto {
  const ProgressPhoto({
    required this.id,
    required this.takenAt,
    this.imageUrl,
    this.caption,
  });

  final String id;
  final String takenAt;
  final String? imageUrl;
  final String? caption;
}
