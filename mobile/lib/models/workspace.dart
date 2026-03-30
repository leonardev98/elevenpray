class WorkspaceSummary {
  const WorkspaceSummary({
    this.todayStatus,
    required this.streakDays,
    this.nextActionLabel,
    this.alertLabel,
  });

  final String? todayStatus;
  final int streakDays;
  final String? nextActionLabel;
  final String? alertLabel;
}

class Workspace {
  const Workspace({
    required this.id,
    required this.name,
    required this.typeSlug,
    required this.categorySlug,
    required this.iconKey,
    required this.isActive,
    required this.summary,
    this.amStepsDone = 0,
    this.amStepsTotal = 0,
    this.pmStepsDone = 0,
    this.pmStepsTotal = 0,
  });

  final String id;
  final String name;
  final String typeSlug;
  final String categorySlug;
  final String iconKey;
  final bool isActive;
  final WorkspaceSummary summary;
  final int amStepsDone;
  final int amStepsTotal;
  final int pmStepsDone;
  final int pmStepsTotal;
}
