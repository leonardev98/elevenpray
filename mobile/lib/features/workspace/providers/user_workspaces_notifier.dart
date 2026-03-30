import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/api/dto/user_workspace_dto.dart';
import '../../../core/api/mitsyy_api.dart';
import '../../auth/providers/auth_session.dart';
import '../../home/utils/workspace_dashboard_mode.dart';
import '../../home/models/dashboard_task.dart';

/// Workspaces del usuario desde el API; workspace activo persistido localmente.
class UserWorkspacesNotifier extends ChangeNotifier {
  UserWorkspacesNotifier({
    required SharedPreferences prefs,
    required AuthSession auth,
    required MitsyyApi api,
  })  : _prefs = prefs,
        _auth = auth,
        _api = api {
    _auth.addListener(_onAuthChanged);
    _onAuthChanged();
  }

  final SharedPreferences _prefs;
  final AuthSession _auth;
  final MitsyyApi _api;

  static const _keyActiveId = 'mitsyy_active_workspace_id';

  List<UserWorkspaceDto> _workspaces = [];
  String? _activeWorkspaceId;
  bool _loading = false;
  String? _error;

  List<UserWorkspaceDto> get workspaces => List.unmodifiable(_workspaces);
  String? get activeWorkspaceId => _activeWorkspaceId;
  bool get loading => _loading;
  String? get error => _error;
  bool get hasWorkspaces => _workspaces.isNotEmpty;

  UserWorkspaceDto? get activeWorkspace {
    final id = _activeWorkspaceId;
    if (id == null) return null;
    for (final w in _workspaces) {
      if (w.id == id) return w;
    }
    return null;
  }

  WorkspaceMode get dashboardMode {
    final t = activeWorkspace?.workspaceType ?? 'general';
    return workspaceModeForType(t);
  }

  void _onAuthChanged() {
    if (_auth.isAuthenticated) {
      refresh();
    } else {
      _workspaces = [];
      _activeWorkspaceId = null;
      _error = null;
      _loading = false;
      notifyListeners();
    }
  }

  void _loadActiveFromPrefs() {
    _activeWorkspaceId = _prefs.getString(_keyActiveId);
  }

  void _reconcileActive() {
    if (_workspaces.isEmpty) {
      _activeWorkspaceId = null;
      _prefs.remove(_keyActiveId);
      return;
    }
    if (_activeWorkspaceId == null || !_workspaces.any((w) => w.id == _activeWorkspaceId)) {
      _activeWorkspaceId = _workspaces.first.id;
      _prefs.setString(_keyActiveId, _activeWorkspaceId!);
    }
  }

  Future<void> refresh() async {
    final token = _auth.accessToken;
    if (token == null) return;

    _loadActiveFromPrefs();
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final list = await _api.listWorkspaces(token);
      list.sort((a, b) {
        final c = a.sortOrder.compareTo(b.sortOrder);
        if (c != 0) return c;
        return a.name.compareTo(b.name);
      });
      _workspaces = list;
      _reconcileActive();
    } catch (e) {
      _error = e.toString();
      _workspaces = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> setActiveWorkspace(String id) async {
    if (!_workspaces.any((w) => w.id == id)) return;
    _activeWorkspaceId = id;
    await _prefs.setString(_keyActiveId, id);
    notifyListeners();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    super.dispose();
  }
}
