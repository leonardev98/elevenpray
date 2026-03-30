import '../../../models/catalog_workspace.dart';

final exploreCatalogBySection = <String, List<CatalogWorkspace>>{
  'Vida y salud': [
    const CatalogWorkspace(
      id: 'c_skincare',
      title: 'Skincare',
      description: 'Rutinas AM/PM, productos y seguimiento.',
      workspaceType: 'skincare',
      iconKey: 'sparkles',
      isActive: true,
    ),
    const CatalogWorkspace(
      id: 'c_fitness',
      title: 'Fitness',
      description: 'Entrena con intención y constancia.',
      workspaceType: 'fitness',
      iconKey: 'dumbbell',
      requiresPro: true,
    ),
    const CatalogWorkspace(
      id: 'c_nutri',
      title: 'Nutrición',
      description: 'Hábitos y comidas alineados a tus metas.',
      workspaceType: 'nutrition',
      iconKey: 'salad',
    ),
    const CatalogWorkspace(
      id: 'c_meditation',
      title: 'Meditación',
      description: 'Espacio para calma y foco.',
      workspaceType: 'meditation',
      iconKey: 'wind',
    ),
  ],
  'Estudios': [
    const CatalogWorkspace(
      id: 'c_uni',
      title: 'Universidad',
      description: 'Clases, exámenes y recordatorios.',
      workspaceType: 'university',
      iconKey: 'book',
      isActive: true,
    ),
    const CatalogWorkspace(
      id: 'c_lang',
      title: 'Idiomas',
      description: 'Vocabulario y práctica diaria.',
      workspaceType: 'languages',
      iconKey: 'globe',
    ),
    const CatalogWorkspace(
      id: 'c_read',
      title: 'Lectura',
      description: 'Libros y notas en un solo lugar.',
      workspaceType: 'reading',
      iconKey: 'book_marked',
    ),
  ],
  'Trabajo': [
    const CatalogWorkspace(
      id: 'c_dev',
      title: 'Developer',
      description: 'Snippets, tareas y foco deep work.',
      workspaceType: 'developer',
      iconKey: 'laptop',
      requiresPro: true,
    ),
    const CatalogWorkspace(
      id: 'c_free',
      title: 'Freelance',
      description: 'Clientes, entregas y facturación.',
      workspaceType: 'freelance',
      iconKey: 'briefcase',
    ),
    const CatalogWorkspace(
      id: 'c_ent',
      title: 'Emprendimiento',
      description: 'Ideas, métricas y siguiente paso.',
      workspaceType: 'startup',
      iconKey: 'rocket',
    ),
  ],
};

Future<Map<String, List<CatalogWorkspace>>> fetchExploreCatalog() async {
  return Map<String, List<CatalogWorkspace>>.from(exploreCatalogBySection);
}
