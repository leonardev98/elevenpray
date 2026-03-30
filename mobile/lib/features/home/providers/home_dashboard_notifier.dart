import 'package:flutter/foundation.dart';

import '../../../core/api/dashboard_week_utils.dart';
import '../../../core/api/dto/dashboard_week_dto.dart';
import '../../../core/api/mitsyy_api.dart';
import '../../auth/providers/auth_session.dart';
import '../../workspace/providers/user_workspaces_notifier.dart';

/// Semana de dashboard del backend para el workspace activo.
class HomeDashboardNotifier extends ChangeNotifier {
  HomeDashboardNotifier({
    required MitsyyApi api,
    required AuthSession auth,
    required UserWorkspacesNotifier workspaces,
  })  : _api = api,
        _auth = auth,
        _workspaces = workspaces {
    _workspaces.addListener(_onSignal);
    _auth.addListener(_onSignal);
    _onSignal();
  }

  final MitsyyApi _api;
  final AuthSession _auth;
  final UserWorkspacesNotifier _workspaces;

  DashboardWeekDto? _week;
  bool _loading = false;
  String? _error;

  DashboardWeekDto? get week => _week;
  bool get loading => _loading;
  String? get error => _error;

  void _onSignal() {
    final token = _auth.accessToken;
    if (token == null) {
      _week = null;
      _error = null;
      _loading = false;
      notifyListeners();
      return;
    }
    if (_workspaces.loading) {
      return;
    }
    final wsId = _workspaces.activeWorkspaceId;
    if (wsId == null) {
      _week = null;
      _error = null;
      _loading = false;
      notifyListeners();
      return;
    }
    refresh();
  }

  Future<void> refresh() async {
    final token = _auth.accessToken;
    final wsId = _workspaces.activeWorkspaceId;
    if (token == null || wsId == null) return;

    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final now = DateTime.now();
      _week = await _api.fetchDashboardWeek(
        accessToken: token,
        year: dashboardYear(now),
        week: dashboardWeekNumber(now),
        workspaceIds: [wsId],
      );
    } catch (e) {
      _error = e.toString();
      _week = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Día de rutina para el workspace activo y [dayKey], o null.
  DashboardRoutineDayDto? routineDayForActiveWorkspace(String dayKey) {
    final id = _workspaces.activeWorkspaceId;
    final w = _week;
    if (id == null || w == null) return null;
    for (final d in w.routineDays) {
      if (d.workspaceId == id && d.dayKey == dayKey) return d;
    }
    return null;
  }

  @override
  void dispose() {
    _workspaces.removeListener(_onSignal);
    _auth.removeListener(_onSignal);
    super.dispose();
  }
}
