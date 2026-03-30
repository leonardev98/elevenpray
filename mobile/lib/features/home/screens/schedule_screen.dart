import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';

import '../../../core/api/dashboard_week_utils.dart';
import '../../../core/theme/dashboard_theme_ext.dart';
import '../../home/providers/home_dashboard_notifier.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';
import '../data/routine_to_dashboard_tasks.dart';
import '../models/dashboard_task.dart';
import '../utils/workspace_dashboard_mode.dart';
import '../widgets/search_bar.dart';
import '../widgets/task_card.dart';
import '../widgets/task_timeline.dart';
import '../widgets/week_calendar.dart';

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({super.key});

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  late DateTime _selectedDay;
  late DateTime _weekStart;
  final _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    final n = DateTime.now();
    _selectedDay = DateTime(n.year, n.month, n.day);
    _weekStart = WeekCalendar.mondayOfWeek(_selectedDay);
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<DashboardTask> _tasksForSelectedDay(HomeDashboardNotifier dash, UserWorkspacesNotifier ws) {
    final id = ws.activeWorkspaceId;
    if (id == null) return [];
    final dayKey = dashboardDayKey(_selectedDay);
    final routineDay = dash.routineDayForActiveWorkspace(dayKey);
    if (routineDay == null) return [];
    final primary = workspacePrimaryForMode(ws.dashboardMode);
    return routineDayToTasks(routineDay, primary);
  }

  bool _hasTasks(HomeDashboardNotifier dash, UserWorkspacesNotifier ws, DateTime day) {
    final id = ws.activeWorkspaceId;
    if (id == null) return false;
    final key = dashboardDayKey(day);
    final rd = dash.routineDayForActiveWorkspace(key);
    if (rd == null) return false;
    for (final g in rd.groups) {
      for (final i in g.items) {
        if (i.type != 'heading' && i.content.trim().isNotEmpty) return true;
      }
    }
    return false;
  }

  List<DashboardTask> _filter(List<DashboardTask> tasks, String q) {
    final t = q.trim().toLowerCase();
    if (t.isEmpty) return tasks;
    return tasks.where((e) {
      if (e.title.toLowerCase().contains(t)) return true;
      return e.tags.any((tag) => tag.label.toLowerCase().contains(t));
    }).toList();
  }

  List<DashboardTask> _unscheduled(List<DashboardTask> tasks) {
    return tasks.where((e) => e.hourSlot == null).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<UserWorkspacesNotifier, HomeDashboardNotifier>(
      builder: (context, ws, dash, _) {
        final mode = ws.dashboardMode;
        final primary = workspacePrimaryForMode(mode);

        return Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            leading: IconButton(
              icon: Icon(LucideIcons.arrowLeft, color: context.dashTextPrimary),
              onPressed: () => context.pop(),
            ),
            title: Text(
              'Agenda',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(color: context.dashTextPrimary),
            ),
            centerTitle: true,
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            children: [
              DashboardSearchBar(controller: _search),
              const SizedBox(height: 16),
              WeekCalendar(
                weekStart: _weekStart,
                selectedDay: _selectedDay,
                primaryColor: primary,
                hasTasksOnDay: (d) => _hasTasks(dash, ws, d),
                onSelectDay: (d) => setState(() {
                  _selectedDay = d;
                  _weekStart = WeekCalendar.mondayOfWeek(d);
                }),
              ),
              const SizedBox(height: 20),
              if (dash.loading && dash.week == null)
                const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
              else
                ValueListenableBuilder<TextEditingValue>(
                  valueListenable: _search,
                  builder: (context, value, _) {
                    final all = _tasksForSelectedDay(dash, ws);
                    final tasks = _filter(all, value.text);
                    final timed = tasks.where((e) => e.hourSlot != null).toList();
                    final loose = _unscheduled(tasks);

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TaskTimeline(
                          tasks: timed,
                          day: _selectedDay,
                          addActionColor: primary,
                          onAddTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Añadir tarea (próximamente)')),
                            );
                          },
                        ),
                        if (loose.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Text(
                            'Sin horario fijo',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontSize: 15,
                                  color: context.dashTextPrimary,
                                ),
                          ),
                          const SizedBox(height: 10),
                          for (final t in loose) ...[
                            TaskCard(task: t),
                            const SizedBox(height: 12),
                          ],
                        ],
                        if (all.isEmpty && !dash.loading)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            child: Text(
                              'Sin ítems de rutina este día.',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                      ],
                    );
                  },
                ),
            ],
          ),
        );
      },
    );
  }
}
