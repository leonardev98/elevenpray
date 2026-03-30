class CatalogWorkspace {
  const CatalogWorkspace({
    required this.id,
    required this.title,
    required this.description,
    required this.workspaceType,
    required this.iconKey,
    this.requiresPro = false,
    this.isActive = false,
    this.categoryLabel,
  });

  final String id;
  final String title;
  final String description;
  final String workspaceType;
  final String iconKey;
  final bool requiresPro;
  final bool isActive;
  final String? categoryLabel;
}
