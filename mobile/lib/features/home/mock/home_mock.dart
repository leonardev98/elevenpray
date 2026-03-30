import '../../../models/workspace.dart';

final mockWorkspaces = <Workspace>[
  Workspace(
    id: 'ws1',
    name: 'Mi Skincare',
    typeSlug: 'skincare',
    categorySlug: 'health',
    iconKey: 'sparkles',
    isActive: true,
    summary: WorkspaceSummary(
      todayStatus: 'Rutina AM completada',
      streakDays: 12,
      nextActionLabel: 'Rutina PM · 7:00 PM',
      alertLabel: null,
    ),
    amStepsDone: 2,
    amStepsTotal: 4,
    pmStepsDone: 0,
    pmStepsTotal: 4,
  ),
  Workspace(
    id: 'ws2',
    name: 'Universidad',
    typeSlug: 'university',
    categorySlug: 'study',
    iconKey: 'book',
    isActive: true,
    summary: WorkspaceSummary(
      todayStatus: '2 clases hoy',
      streakDays: 5,
      nextActionLabel: 'Cálculo · 10:00 AM',
      alertLabel: 'Examen el viernes',
    ),
    amStepsDone: 1,
    amStepsTotal: 3,
    pmStepsDone: 0,
    pmStepsTotal: 2,
  ),
];

int get mockGlobalStreakDays =>
    mockWorkspaces.map((w) => w.summary.streakDays).reduce((a, b) => a > b ? a : b);

/// Alias para pantallas que usan el nombre del plan.
int get homeMockGlobalStreak => mockGlobalStreakDays;

Future<List<Workspace>> fetchHomeWorkspaces() async {
  return List<Workspace>.from(mockWorkspaces);
}
