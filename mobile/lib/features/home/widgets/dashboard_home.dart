import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/api/dashboard_week_utils.dart';
import '../../../core/theme/dashboard_theme_ext.dart';
import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../../../models/user.dart';
import '../../home/providers/home_dashboard_notifier.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';
import '../data/routine_to_dashboard_tasks.dart';
import '../models/dashboard_task.dart';
import '../utils/workspace_dashboard_mode.dart';
import 'active_workspace_switcher.dart';
import 'search_bar.dart';
import 'stat_card.dart';
import 'task_card.dart';

class DashboardHome extends StatelessWidget {
  const DashboardHome({
    super.key,
    required this.user,
    required this.searchController,
  });

  final User user;
  final TextEditingController searchController;

  static List<BoxShadow> _glow(WorkspaceMode mode) {
    switch (mode) {
      case WorkspaceMode.universidad:
        return [
          BoxShadow(
            color: WorkspaceDashboardTokens.uniGlow.withValues(alpha: 0.35),
            blurRadius: 24,
            spreadRadius: -4,
          ),
        ];
      case WorkspaceMode.skincare:
        return [
          BoxShadow(
            color: WorkspaceDashboardTokens.skinGlow.withValues(alpha: 0.35),
            blurRadius: 24,
            spreadRadius: -4,
          ),
        ];
      case WorkspaceMode.developer:
        return [
          BoxShadow(
            color: WorkspaceDashboardTokens.devGlow.withValues(alpha: 0.35),
            blurRadius: 24,
            spreadRadius: -4,
          ),
        ];
      case WorkspaceMode.generic:
        return [
          BoxShadow(
            color: WorkspaceDashboardTokens.genericGlow.withValues(alpha: 0.35),
            blurRadius: 24,
            spreadRadius: -4,
          ),
        ];
    }
  }

  static List<DashboardTask> _filter(List<DashboardTask> tasks, String q) {
    final t = q.trim().toLowerCase();
    if (t.isEmpty) return tasks;
    return tasks.where((e) {
      if (e.title.toLowerCase().contains(t)) return true;
      return e.tags.any((tag) => tag.label.toLowerCase().contains(t));
    }).toList();
  }

  static String _subtitle(WorkspaceMode mode) {
    switch (mode) {
      case WorkspaceMode.universidad:
        return 'Tu semana y rutina desde el servidor.';
      case WorkspaceMode.skincare:
        return 'Rutina y cuidado alineados a tu workspace.';
      case WorkspaceMode.developer:
        return 'Organiza entregas y foco en este espacio.';
      case WorkspaceMode.generic:
        return 'Contenido del workspace activo.';
    }
  }

  String _initials(String name) {
    final p = name.trim().split(RegExp(r'\s+'));
    if (p.isEmpty) return '?';
    if (p.length == 1) return p[0].substring(0, 1).toUpperCase();
    return '${p[0].substring(0, 1)}${p[1].substring(0, 1)}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<UserWorkspacesNotifier, HomeDashboardNotifier>(
      builder: (context, ws, dash, _) {
        final mode = ws.dashboardMode;
        final primary = workspacePrimaryForMode(mode);
        final dayKey = dashboardDayKey(DateTime.now());
        final routineDay = dash.routineDayForActiveWorkspace(dayKey);
        final apiTasks = routineDay != null ? routineDayToTasks(routineDay, primary) : <DashboardTask>[];

        var groupCount = routineDay?.groups.length ?? 0;
        var itemCount = 0;
        if (routineDay != null) {
          for (final g in routineDay.groups) {
            itemCount += g.items.where((i) => i.type != 'heading' && i.content.trim().isNotEmpty).length;
          }
        }

        final stats = statsFromRoutineSummary(
          itemCount: itemCount,
          groupCount: groupCount,
          workspaceTitle: ws.activeWorkspace?.name ?? '—',
        );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FadeInDown(duration: const Duration(milliseconds: 360), child: const WorkspaceActiveHeader()),
            const SizedBox(height: 22),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: FadeInLeft(
                    duration: const Duration(milliseconds: 340),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hola, ${user.name.split(' ').first}',
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _subtitle(mode),
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: context.dashTextSecondary,
                                fontSize: 13,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
                FadeInRight(
                  duration: const Duration(milliseconds: 320),
                  child: CircleAvatar(
                    radius: 26,
                    backgroundColor: primary.withValues(alpha: 0.22),
                    child: Text(
                      _initials(user.name),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: primary,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            FadeIn(
              delay: const Duration(milliseconds: 100),
              child: DashboardSearchBar(controller: searchController),
            ),
            const SizedBox(height: 22),
            if (dash.loading && apiTasks.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (dash.error != null && apiTasks.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  dash.error!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.error),
                ),
              )
            else if (!ws.hasWorkspaces)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 24),
                child: Text(
                  ws.error != null
                      ? 'No se pudieron cargar los workspaces: ${ws.error}'
                      : 'No tienes workspaces en esta cuenta. Créalos desde la app web o el panel.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: context.dashTextSecondary),
                ),
              )
            else ...[
              LayoutBuilder(
                builder: (context, constraints) {
                  final w = (constraints.maxWidth - 12) / 2;
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: List.generate(4, (i) {
                      return SizedBox(
                        width: w,
                        child: StatCard(
                          stat: stats[i],
                          accentColor: statColorForIndex(i),
                          glowShadows: _glow(mode),
                          animationDelay: Duration(milliseconds: i * 80),
                        ),
                      );
                    }),
                  );
                },
              ),
              const SizedBox(height: 28),
              Row(
                children: [
                  Text(
                    'Tareas de hoy',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () => context.push('/home/schedule'),
                    style: TextButton.styleFrom(
                      foregroundColor: primary,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    child: const Text('Ver todo'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: searchController,
                builder: (context, value, _) {
                  final tasks = _filter(apiTasks, value.text);
                  if (tasks.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Text(
                        routineDay == null
                            ? 'No hay rutina para este día en el workspace (o el tipo no incluye rutina).'
                            : 'No hay tareas que coincidan.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    );
                  }
                  return Column(
                    children: [
                      for (var i = 0; i < tasks.length; i++) ...[
                        FadeInUp(
                          delay: Duration(milliseconds: 120 + i * 60),
                          duration: const Duration(milliseconds: 400),
                          child: TaskCard(task: tasks[i]),
                        ),
                        if (i < tasks.length - 1) const SizedBox(height: 12),
                      ],
                    ],
                  );
                },
              ),
            ],
          ],
        );
      },
    );
  }
}
