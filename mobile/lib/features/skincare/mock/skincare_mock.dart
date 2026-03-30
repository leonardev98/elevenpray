import '../../../core/utils/routine_day_key.dart';
import '../../../models/product.dart';
import '../../../models/progress_photo.dart';
import '../../../models/routine_template.dart';
import '../../../models/skin_checkin.dart';

const String kSkincareWorkspaceId = 'ws1';

List<DayItem> get _mockAmItems => const [
      DayItem(
        id: 's1',
        type: 'list',
        content: 'Limpiador suave',
        productId: 'p1',
        stepType: 'cleanser',
        instructions: 'Masajea en círculos por 60 segundos',
        durationSeconds: 60,
      ),
      DayItem(
        id: 's2',
        type: 'list',
        content: 'Tónico hidratante',
        productId: 'p2',
        stepType: 'toner',
        instructions: 'Aplica con algodón o palmas',
        durationSeconds: 30,
      ),
      DayItem(
        id: 's3',
        type: 'list',
        content: 'Vitamina C serum',
        productId: 'p3',
        stepType: 'serum',
        instructions: '3-4 gotas, cubre cuello también',
        durationSeconds: 45,
      ),
      DayItem(
        id: 's4',
        type: 'list',
        content: 'Hidratante SPF 50',
        productId: 'p4',
        stepType: 'spf',
        instructions: 'Último paso. No olvides el cuello.',
        durationSeconds: 30,
      ),
    ];

List<DayItem> get _mockPmItems => const [
      DayItem(
        id: 's5',
        type: 'list',
        content: 'Aceite limpiador',
        productId: 'p5',
        stepType: 'cleanser',
        instructions: 'Primer limpiado para disolver maquillaje y SPF',
        durationSeconds: 90,
      ),
      DayItem(
        id: 's6',
        type: 'list',
        content: 'Limpiador espumoso',
        productId: 'p1',
        stepType: 'cleanser',
        instructions: 'Segundo limpiado sobre piel húmeda',
        durationSeconds: 60,
      ),
      DayItem(
        id: 's7',
        type: 'list',
        content: 'Retinol 0.3%',
        productId: 'p6',
        stepType: 'treatment',
        instructions: 'Solo PM. Evita área de ojos. 2-3 veces/semana.',
        durationSeconds: 45,
      ),
      DayItem(
        id: 's8',
        type: 'list',
        content: 'Crema hidratante PM',
        productId: 'p7',
        stepType: 'moisturizer',
        instructions: 'Aplica sobre piel ligeramente húmeda para sellar',
        durationSeconds: 30,
      ),
    ];

DayContent _skincareDayContent() {
  return DayContent(
    groups: [
      RoutineDayGroup(id: 'g_am', title: 'Mañana', slot: 'am', items: _mockAmItems),
      RoutineDayGroup(id: 'g_pm', title: 'Noche', slot: 'pm', items: _mockPmItems),
    ],
  );
}

RoutineTemplate buildMockSkincareRoutineTemplate() {
  final content = _skincareDayContent();
  final days = <String, DayContent>{};
  for (final k in kRoutineDayKeys) {
    days[k] = content;
  }
  return RoutineTemplate(
    id: 'rt1',
    workspaceId: kSkincareWorkspaceId,
    name: 'Mi rutina',
    days: days,
  );
}

final mockProducts = <Product>[
  Product(
    id: 'p1',
    workspaceId: kSkincareWorkspaceId,
    name: 'Gentle Cleanser',
    category: 'cleanser',
    status: 'active',
    brand: 'CeraVe',
    usageTime: 'both',
    imageUrl: 'https://picsum.photos/seed/p1/200/200',
  ),
  Product(
    id: 'p2',
    workspaceId: kSkincareWorkspaceId,
    name: 'Tónico AHA/BHA',
    category: 'toner',
    status: 'active',
    brand: 'COSRX',
    usageTime: 'am',
    imageUrl: 'https://picsum.photos/seed/p2/200/200',
  ),
  Product(
    id: 'p3',
    workspaceId: kSkincareWorkspaceId,
    name: 'Vitamin C 15%',
    category: 'serum',
    status: 'active',
    brand: 'Timeless',
    usageTime: 'am',
    imageUrl: 'https://picsum.photos/seed/p3/200/200',
  ),
  Product(
    id: 'p4',
    workspaceId: kSkincareWorkspaceId,
    name: 'Ultra Facial SPF 50',
    category: 'sunscreen',
    status: 'active',
    brand: "Kiehl's",
    usageTime: 'am',
    imageUrl: 'https://picsum.photos/seed/p4/200/200',
  ),
  Product(
    id: 'p5',
    workspaceId: kSkincareWorkspaceId,
    name: 'Aceite de Limpieza',
    category: 'cleanser',
    status: 'active',
    brand: 'DHC',
    usageTime: 'pm',
    imageUrl: 'https://picsum.photos/seed/p5/200/200',
  ),
  Product(
    id: 'p6',
    workspaceId: kSkincareWorkspaceId,
    name: 'Retinol 0.3%',
    category: 'retinoid',
    status: 'active',
    brand: "Paula's Choice",
    usageTime: 'pm',
    imageUrl: 'https://picsum.photos/seed/p6/200/200',
  ),
  Product(
    id: 'p7',
    workspaceId: kSkincareWorkspaceId,
    name: 'Crema PM',
    category: 'moisturizer',
    status: 'active',
    brand: 'Lab Mínimo',
    usageTime: 'pm',
    imageUrl: null,
  ),
];

final mockRecentCheckins = <SkinCheckin>[
  SkinCheckin(
    id: 'c1',
    workspaceId: kSkincareWorkspaceId,
    date: DateTime(2026, 3, 26),
    hydration: 0.72,
    redness: 0.2,
    brightness: 0.65,
    photoUrl: null,
    note: 'Piel calmada',
  ),
  SkinCheckin(
    id: 'c2',
    workspaceId: kSkincareWorkspaceId,
    date: DateTime(2026, 3, 25),
    hydration: 0.6,
    redness: 0.35,
    brightness: 0.5,
    photoUrl: null,
    note: null,
  ),
  SkinCheckin(
    id: 'c3',
    workspaceId: kSkincareWorkspaceId,
    date: DateTime(2026, 3, 24),
    hydration: 0.55,
    redness: 0.4,
    brightness: 0.48,
    photoUrl: null,
    note: null,
  ),
];

final mockProgressPhotos = <ProgressPhoto>[
  const ProgressPhoto(id: 'ph1', takenAt: '2026-03-26', caption: '26 mar'),
  const ProgressPhoto(id: 'ph2', takenAt: '2026-03-25', caption: '25 mar'),
  const ProgressPhoto(id: 'ph3', takenAt: '2026-03-24', caption: '24 mar'),
  const ProgressPhoto(id: 'ph4', takenAt: '2026-03-20', caption: '20 mar'),
  const ProgressPhoto(id: 'ph5', takenAt: '2026-03-18', caption: '18 mar'),
  const ProgressPhoto(id: 'ph6', takenAt: '2026-03-15', caption: '15 mar'),
];

Future<RoutineTemplate> fetchSkincareRoutineTemplate() async {
  return buildMockSkincareRoutineTemplate();
}

Future<List<Product>> fetchSkincareProducts() async {
  return List<Product>.from(mockProducts);
}

Future<List<SkinCheckin>> fetchRecentCheckins() async {
  return List<SkinCheckin>.from(mockRecentCheckins);
}

Future<List<ProgressPhoto>> fetchProgressPhotos() async {
  return List<ProgressPhoto>.from(mockProgressPhotos);
}

/// Serie mock 0–1 para gráficas (7 días).
List<double> mockMetricSeriesA() => const [0.5, 0.55, 0.52, 0.6, 0.58, 0.65, 0.72];
List<double> mockMetricSeriesB() => const [0.4, 0.35, 0.38, 0.3, 0.28, 0.22, 0.2];
List<double> mockMetricSeriesC() => const [0.45, 0.48, 0.5, 0.52, 0.55, 0.6, 0.65];

/// Días con check-in esta semana (índices 0=lun … 6=dom) — mock.
Set<int> mockCheckinWeekdayIndices() => {0, 1, 2, 4, 5};
