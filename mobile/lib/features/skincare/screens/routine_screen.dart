import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/mitsyy_glass_surface.dart';
import '../../../core/utils/mock_delay.dart';
import '../../../core/utils/routine_day_key.dart';
import '../../../core/widgets/mitsyy_skeleton.dart';
import '../../../models/product.dart';
import '../../../models/routine_step.dart' as ui;
import '../../../models/routine_template.dart';
import '../mock/skincare_mock.dart';
import '../providers/skincare_routine_provider.dart';
import '../routine_slot.dart';
import '../widgets/am_pm_toggle.dart';
import '../widgets/routine_step_card.dart';

class RoutineScreen extends StatefulWidget {
  const RoutineScreen({super.key});

  @override
  State<RoutineScreen> createState() => _RoutineScreenState();
}

class _RoutineScreenState extends State<RoutineScreen> {
  late final Future<({RoutineTemplate template, Map<String, Product> products})> _future;
  bool _syncedSlot = false;
  RoutineSlot _slot = RoutineSlot.am;

  @override
  void initState() {
    super.initState();
    _future = withMockDelay(() async {
      final t = await fetchSkincareRoutineTemplate();
      final products = await fetchSkincareProducts();
      final map = {for (final p in products) p.id: p};
      return (template: t, products: map);
    });
  }

  List<ui.RoutineStep> _visibleSteps(
    RoutineTemplate t,
    Map<String, Product> productsById,
    Set<String> completed,
  ) {
    final dayKey = routineTodayDayKey();
    final day = t.days[dayKey] ?? const DayContent();
    final groups = day.groups ?? [];
    final want = _slot == RoutineSlot.am ? 'am' : 'pm';
    RoutineDayGroup? match;
    for (final g in groups) {
      if (g.slot == want) {
        match = g;
        break;
      }
    }
    final items = match?.items ?? [];
    return items
        .map(
          (e) => ui.RoutineStep.fromDayItem(
            e,
            productsById,
            isCompleted: completed.contains(e.id),
          ),
        )
        .toList();
  }

  int _remainingSeconds(List<ui.RoutineStep> steps) {
    return steps.where((s) => !s.isCompleted).fold<int>(0, (a, s) => a + s.durationSeconds);
  }

  Future<void> _onToggle(
    SkincareRoutineNotifier n,
    String stepId,
    List<ui.RoutineStep> steps,
  ) async {
    await n.toggleStep(SkincareRoutineNotifier.workspaceIdMock, DateTime.now(), stepId);
    if (!mounted) return;
    final updated = n.completedIdsFor(SkincareRoutineNotifier.workspaceIdMock, DateTime.now());
    final allComplete = steps.isNotEmpty && steps.every((s) => updated.contains(s.id));
    if (allComplete) {
      _showCelebration(context);
    }
  }

  void _showCelebration(BuildContext context) {
    final nav = Navigator.of(context);
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        final theme = Theme.of(ctx);
        return Dialog(
          backgroundColor: Colors.transparent,
          child: MitsyyGlassSurface(
            padding: const EdgeInsets.all(24),
            blurSigma: 22,
            fillTopAlpha: 0.8,
            fillBottomAlpha: 0.55,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.sparkles, size: 44, color: AppColors.gold.withValues(alpha: 0.95)),
                const SizedBox(height: 14),
                Text(
                  '¡Rutina completada!',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.displaySmall?.copyWith(color: AppColors.gold, fontSize: 26),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.flame, size: 20, color: AppColors.gold.withValues(alpha: 0.85)),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '12 días seguidos',
                        style: theme.textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(ctx).pop();
                      nav.pop();
                    },
                    child: const Text('Perfecto'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notifier = context.watch<SkincareRoutineNotifier>();
    if (!_syncedSlot) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _slot = notifier.slot;
            _syncedSlot = true;
          });
        }
      });
    }

    final dateStr = DateFormat("d 'de' MMMM", 'es').format(DateTime.now());

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(
          _slot == RoutineSlot.am ? 'Rutina AM' : 'Rutina PM',
          style: theme.textTheme.titleLarge,
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: Text(
                dateStr,
                style: theme.textTheme.labelMedium,
              ),
            ),
          ),
        ],
      ),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return Padding(
              padding: const EdgeInsets.all(AppColors.horizontalMargin),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: const [
                  MitsyySkeleton(height: 48),
                  SizedBox(height: 20),
                  MitsyySkeleton(height: 88),
                  SizedBox(height: 16),
                  MitsyySkeleton(height: 88),
                ],
              ),
            );
          }
          final bundle = snapshot.data!;
          final completed = notifier.completedIdsFor(SkincareRoutineNotifier.workspaceIdMock, DateTime.now());
          final steps = _visibleSteps(bundle.template, bundle.products, completed);
          final total = steps.length;
          final doneCount = steps.where((s) => completed.contains(s.id)).length;
          final frac = total == 0 ? 0.0 : doneCount / total;
          final rem = _remainingSeconds(
            steps.map((s) => s.copyWith(isCompleted: completed.contains(s.id))).toList(),
          );

          int firstIncomplete = -1;
          for (var i = 0; i < steps.length; i++) {
            if (!completed.contains(steps[i].id)) {
              firstIncomplete = i;
              break;
            }
          }

          return ListView(
            padding: const EdgeInsets.all(AppColors.horizontalMargin),
            children: [
              AmPmToggle(
                value: _slot,
                onChanged: (v) {
                  setState(() => _slot = v);
                  notifier.setSlot(v);
                },
              ),
              const SizedBox(height: 24),
              FadeInDown(
                duration: const Duration(milliseconds: 240),
                child: SizedBox(
                  height: 140,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 132,
                        height: 132,
                        child: CircularProgressIndicator(
                          value: frac,
                          strokeWidth: 8,
                          backgroundColor: AppColors.borderMuted,
                          color: AppColors.gold,
                          strokeCap: StrokeCap.round,
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '$doneCount/$total',
                            style: theme.textTheme.displaySmall?.copyWith(fontSize: 32, color: AppColors.gold),
                          ),
                          Text(
                            'pasos completados',
                            style: theme.textTheme.labelMedium,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            rem > 0 ? '~${(rem / 60).ceil()} min restantes' : 'Listo',
                            style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),
              ...List.generate(steps.length, (i) {
                final step = steps[i];
                final isDone = completed.contains(step.id);
                final mapped = step.copyWith(isCompleted: isDone);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: RoutineStepCard(
                    step: mapped,
                    index: i,
                    highlight: i == firstIncomplete,
                    onToggle: () => _onToggle(notifier, step.id, steps),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
