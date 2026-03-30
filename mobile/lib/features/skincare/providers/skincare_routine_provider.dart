import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../routine_slot.dart';

/// Estado local de rutina (slot AM/PM y pasos completados por workspace y fecha).
class SkincareRoutineNotifier extends ChangeNotifier {
  SkincareRoutineNotifier(this._prefs);

  final SharedPreferences _prefs;

  static const workspaceIdMock = 'ws1';

  static String _dateKey(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  RoutineSlot _slot = RoutineSlot.am;

  RoutineSlot get slot => _slot;

  void loadPersistedState() {
    final hour = DateTime.now().hour;
    _slot = hour < 14 ? RoutineSlot.am : RoutineSlot.pm;
    final saved = _prefs.getString('mitsyy_default_routine_slot');
    if (saved == 'pm') _slot = RoutineSlot.pm;
    if (saved == 'am') _slot = RoutineSlot.am;
    notifyListeners();
  }

  void setSlot(RoutineSlot value) {
    _slot = value;
    unawaited(
      _prefs.setString('mitsyy_default_routine_slot', value == RoutineSlot.am ? 'am' : 'pm'),
    );
    notifyListeners();
  }

  Set<String> completedIdsFor(String workspaceId, DateTime date) {
    final key = 'mitsyy_routine_${workspaceId}_${_dateKey(date)}';
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return {};
    return raw.split(',').where((e) => e.isNotEmpty).toSet();
  }

  Future<void> setCompletedIds(String workspaceId, DateTime date, Set<String> ids) async {
    final key = 'mitsyy_routine_${workspaceId}_${_dateKey(date)}';
    if (ids.isEmpty) {
      await _prefs.remove(key);
    } else {
      await _prefs.setString(key, ids.join(','));
    }
    notifyListeners();
  }

  Future<void> toggleStep(String workspaceId, DateTime date, String stepId) async {
    final cur = completedIdsFor(workspaceId, date);
    if (cur.contains(stepId)) {
      cur.remove(stepId);
    } else {
      cur.add(stepId);
    }
    await setCompletedIds(workspaceId, date, cur);
  }

  Future<void> clearDay(String workspaceId, DateTime date) async {
    await setCompletedIds(workspaceId, date, {});
  }
}
