import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspacePreferencesService } from '../workspace-preferences/workspace-preferences.service';
import { RoutineProvider } from './providers/routine.provider';
import { EntriesProvider } from './providers/entries.provider';
import { WorkspaceSummaryProvider } from './providers/workspace-summary.provider';
import type { DashboardScope } from './dto/dashboard-query.dto';
import { getWeekDateRange } from './dashboard.constants';
import type {
  DashboardWeekDto,
  DashboardRoutineDay,
  DashboardRoutineGroup,
  DashboardEntry,
} from './dashboard.types';

export { getWeekDateRange, DAY_KEYS } from './dashboard.constants';
export type { DashboardRoutineGroup, DashboardRoutineDay, DashboardEntry, DashboardWeekDto } from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly workspacePreferencesService: WorkspacePreferencesService,
    private readonly routineProvider: RoutineProvider,
    private readonly entriesProvider: EntriesProvider,
    private readonly workspaceSummaryProvider: WorkspaceSummaryProvider,
  ) {}

  /** Resolve workspace IDs from scope (and optionally explicit workspaceIds). */
  private async resolveWorkspaceIds(
    userId: string,
    scope: DashboardScope | undefined,
    workspaceIds: string[] | undefined,
  ): Promise<string[]> {
    if (workspaceIds?.length) return workspaceIds;
    const scopeType = scope ?? 'all';
    const allWorkspaces = await this.workspacesService.findAllByUserId(userId);
    const allIds = allWorkspaces.map((w) => w.id);
    if (scopeType === 'all') return allIds;
    if (scopeType === 'favorites') {
      const favIds = await this.workspacePreferencesService.getFavoriteWorkspaceIds(userId);
      return allIds.filter((id) => favIds.includes(id));
    }
    if (scopeType === 'selected') {
      const uiState = await this.workspacePreferencesService.getUiState(userId);
      const selected = uiState.selectedWorkspaceIds ?? [];
      return allIds.filter((id) => selected.includes(id));
    }
    if (scopeType === 'current') {
      const uiState = await this.workspacePreferencesService.getUiState(userId);
      const current = uiState.currentWorkspaceId;
      return current ? [current] : [];
    }
    return allIds;
  }

  async getWeekQuery(
    userId: string,
    year: number,
    weekNumber: number,
    scope?: DashboardScope,
    workspaceIds?: string[],
  ): Promise<DashboardWeekDto> {
    const { from, to } = getWeekDateRange(year, weekNumber);
    const resolvedIds = await this.resolveWorkspaceIds(userId, scope, workspaceIds);
    const [routineDays, entries, workspaceSummaries] = await Promise.all([
      this.routineProvider.getRoutineDays(userId, year, weekNumber, resolvedIds),
      this.entriesProvider.getEntries(userId, from, to, resolvedIds),
      this.workspaceSummaryProvider.getSummaries(userId, resolvedIds),
    ]);
    return {
      year,
      weekNumber,
      from,
      to,
      routineDays,
      entries,
      workspaceSummaries,
    };
  }

  /** GET /dashboard/week compatibility: same as scope 'all'. */
  async getWeek(userId: string, year: number, weekNumber: number): Promise<DashboardWeekDto> {
    return this.getWeekQuery(userId, year, weekNumber, 'all');
  }
}
