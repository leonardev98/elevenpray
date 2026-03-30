import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/mock_delay.dart';
import '../../../core/utils/routine_day_key.dart';
import '../../../core/widgets/mitsyy_card.dart';
import '../../../core/widgets/mitsyy_floating_bottom_nav.dart';
import '../../../core/widgets/mitsyy_glass_surface.dart';
import '../../../models/routine_template.dart';
import '../../../models/skin_checkin.dart';
import '../mock/skincare_mock.dart';
import '../providers/skincare_routine_provider.dart';
import '../routine_slot.dart';
import '../widgets/am_pm_toggle.dart';

class SkincareHomeScreen extends StatefulWidget {
  const SkincareHomeScreen({super.key});

  @override
  State<SkincareHomeScreen> createState() => _SkincareHomeScreenState();
}

class _SkincareHomeScreenState extends State<SkincareHomeScreen> {
  late final Future<RoutineTemplate> _routineFuture;
  late final Future<List<SkinCheckin>> _checkinsFuture;

  @override
  void initState() {
    super.initState();
    _routineFuture = withMockDelay(fetchSkincareRoutineTemplate);
    _checkinsFuture = withMockDelay(fetchRecentCheckins);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notifier = context.watch<SkincareRoutineNotifier>();

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        leading: context.canPop()
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.pop(),
              )
            : null,
        title: Text('Mis espacios', style: theme.textTheme.titleLarge),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: FutureBuilder<RoutineTemplate>(
        future: _routineFuture,
        builder: (context, snap) {
          final dayKey = routineTodayDayKey();
          final day = snap.data?.days[dayKey] ?? const DayContent();
          final groups = day.groups ?? [];
          RoutineDayGroup? amG;
          RoutineDayGroup? pmG;
          for (final g in groups) {
            if (g.slot == 'am') amG = g;
            if (g.slot == 'pm') pmG = g;
          }
          final amTotal = amG?.items.length ?? 0;
          final pmTotal = pmG?.items.length ?? 0;
          final completed = notifier.completedIdsFor(SkincareRoutineNotifier.workspaceIdMock, DateTime.now());
          final amDone = amG?.items.where((e) => completed.contains(e.id)).length ?? 0;
          final pmDone = pmG?.items.where((e) => completed.contains(e.id)).length ?? 0;
          final slot = notifier.slot;
          final curDone = slot == RoutineSlot.am ? amDone : pmDone;
          final curTotal = slot == RoutineSlot.am ? amTotal : pmTotal;
          final frac = curTotal == 0 ? 0.0 : curDone / curTotal;

          return ListView(
            padding: MitsyyFloatingBottomNav.listPadding(
              context,
              const EdgeInsets.all(AppColors.horizontalMargin),
            ),
            children: [
              Row(
                children: [
                  MitsyyGlassSurface(
                    borderRadius: BorderRadius.circular(20),
                    blurSigma: 18,
                    fillTopAlpha: 0.62,
                    fillBottomAlpha: 0.42,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Row(
                      children: [
                        Icon(LucideIcons.flame, size: 16, color: AppColors.gold.withValues(alpha: 0.95)),
                        const SizedBox(width: 6),
                        Text(
                          '12 días · este espacio',
                          style: theme.textTheme.labelMedium?.copyWith(color: AppColors.gold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text('Estado de hoy', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              AmPmToggle(
                value: notifier.slot,
                onChanged: notifier.setSlot,
              ),
              const SizedBox(height: 16),
              Text(
                '$curDone de $curTotal pasos completados',
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: frac.clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: AppColors.borderMuted,
                  color: AppColors.gold,
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push('/skincare/routine'),
                  child: Text(curDone < curTotal ? 'Continuar rutina →' : 'Ver rutina ${slot == RoutineSlot.am ? 'PM' : 'AM'} →'),
                ),
              ),
              const SizedBox(height: 32),
              Text('Accesos rápidos', style: theme.textTheme.titleMedium),
              const SizedBox(height: 14),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.15,
                children: [
                  _QuickCard(
                    icon: LucideIcons.clipboardList,
                    title: 'Mi Rutina',
                    onTap: () => context.push('/skincare/routine'),
                  ),
                  _QuickCard(
                    icon: LucideIcons.sprayCan,
                    title: 'Mis Productos',
                    onTap: () => context.push('/skincare/products'),
                  ),
                  _QuickCard(
                    icon: LucideIcons.image,
                    title: 'Foto del día',
                    onTap: () => context.push('/skincare/checkin'),
                  ),
                  _QuickCard(
                    icon: LucideIcons.barChart3,
                    title: 'Mi Progreso',
                    onTap: () => context.push('/skincare/progress'),
                  ),
                ],
              ),
              const SizedBox(height: 28),
              Text('Últimos check-ins', style: theme.textTheme.titleMedium),
              const SizedBox(height: 12),
              SizedBox(
                height: 120,
                child: FutureBuilder<List<SkinCheckin>>(
                  future: _checkinsFuture,
                  builder: (context, cSnap) {
                    if (!cSnap.hasData) {
                      return ListView(
                        scrollDirection: Axis.horizontal,
                        children: const [
                          SizedBox(width: 140, child: Card(child: SizedBox.expand())),
                          SizedBox(width: 12),
                          SizedBox(width: 140, child: Card(child: SizedBox.expand())),
                        ],
                      );
                    }
                    final list = cSnap.data!;
                    return ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: list.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (context, i) {
                        final c = list[i];
                        return SizedBox(
                          width: 160,
                          child: MitsyyCard(
                            onTap: () => context.push('/skincare/checkin'),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  DateFormat('d MMM', 'es').format(c.date),
                                  style: theme.textTheme.labelLarge,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 8),
                                Expanded(
                                  child: Align(
                                    alignment: Alignment.topLeft,
                                    child: Wrap(
                                      spacing: 4,
                                      runSpacing: 4,
                                      children: [
                                        _MetricChip(icon: LucideIcons.droplets, iconColor: const Color(0xFF4A90C8), value: c.hydration),
                                        _MetricChip(icon: LucideIcons.circleDot, iconColor: const Color(0xFFD64545), value: c.redness),
                                        _MetricChip(icon: LucideIcons.sparkles, iconColor: AppColors.gold, value: c.brightness),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _QuickCard extends StatelessWidget {
  const _QuickCard({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return MitsyyCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 28, color: AppColors.gold.withValues(alpha: 0.9)),
          const Spacer(),
          Text(title, style: theme.textTheme.titleSmall),
        ],
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.icon, required this.iconColor, required this.value});

  final IconData icon;
  final Color iconColor;
  final double value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(6),
        color: AppColors.borderMuted,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: iconColor),
          const SizedBox(width: 3),
          Text(
            '${(value * 100).round()}',
            style: theme.textTheme.labelSmall?.copyWith(fontSize: 10, height: 1.1),
          ),
        ],
      ),
    );
  }
}
