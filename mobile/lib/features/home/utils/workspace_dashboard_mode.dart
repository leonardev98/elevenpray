import 'package:flutter/material.dart';

import '../../../core/theme/workspace_dashboard_tokens.dart';
import '../models/dashboard_task.dart';

WorkspaceMode workspaceModeForType(String workspaceType) {
  switch (workspaceType) {
    case 'university':
    case 'study':
      return WorkspaceMode.universidad;
    case 'skincare':
      return WorkspaceMode.skincare;
    case 'work':
    case 'developer':
      return WorkspaceMode.developer;
    default:
      return WorkspaceMode.generic;
  }
}

/// Color de acento principal según el modo del dashboard.
Color workspacePrimaryForMode(WorkspaceMode mode) {
  switch (mode) {
    case WorkspaceMode.universidad:
      return WorkspaceDashboardTokens.uniPrimary;
    case WorkspaceMode.skincare:
      return WorkspaceDashboardTokens.skinPrimary;
    case WorkspaceMode.developer:
      return WorkspaceDashboardTokens.devPrimary;
    case WorkspaceMode.generic:
      return WorkspaceDashboardTokens.genericPrimary;
  }
}

List<Color> workspaceFabGradientForMode(WorkspaceMode mode) {
  switch (mode) {
    case WorkspaceMode.universidad:
      return [WorkspaceDashboardTokens.uniPrimary, WorkspaceDashboardTokens.uniSecondary];
    case WorkspaceMode.skincare:
      return [WorkspaceDashboardTokens.skinPrimary, WorkspaceDashboardTokens.skinSecondary];
    case WorkspaceMode.developer:
      return [WorkspaceDashboardTokens.devPrimary, WorkspaceDashboardTokens.devSecondary];
    case WorkspaceMode.generic:
      return [WorkspaceDashboardTokens.genericPrimary, WorkspaceDashboardTokens.genericSecondary];
  }
}

Color workspaceFabGlowForMode(WorkspaceMode mode) {
  switch (mode) {
    case WorkspaceMode.universidad:
      return WorkspaceDashboardTokens.uniGlow;
    case WorkspaceMode.skincare:
      return WorkspaceDashboardTokens.skinGlow;
    case WorkspaceMode.developer:
      return WorkspaceDashboardTokens.devGlow;
    case WorkspaceMode.generic:
      return WorkspaceDashboardTokens.genericGlow;
  }
}
