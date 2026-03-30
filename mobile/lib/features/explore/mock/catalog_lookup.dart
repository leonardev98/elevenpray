import '../../../models/catalog_workspace.dart';
import 'explore_mock.dart';

/// Lista plana de todos los workspaces del catálogo (explorar / onboarding).
List<CatalogWorkspace> get allCatalogWorkspaces {
  final out = <CatalogWorkspace>[];
  for (final entry in exploreCatalogBySection.entries) {
    final section = entry.key;
    for (final w in entry.value) {
      out.add(
        CatalogWorkspace(
          id: w.id,
          title: w.title,
          description: w.description,
          workspaceType: w.workspaceType,
          iconKey: w.iconKey,
          requiresPro: w.requiresPro,
          isActive: w.isActive,
          categoryLabel: section,
        ),
      );
    }
  }
  return out;
}

CatalogWorkspace? catalogWorkspaceById(String id) {
  for (final w in allCatalogWorkspaces) {
    if (w.id == id) return w;
  }
  return null;
}

String? catalogSectionForId(String id) => catalogWorkspaceById(id)?.categoryLabel;
