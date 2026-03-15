import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { RoutineTemplatesService } from '../../routine-templates/routine-templates.service';
import { hasRoutineCapability } from '../../workspace-types/workspace-type.registry';
import type { DayGroup } from '../../routine-templates/entities/routine-template.entity';
import type { DashboardWorkspaceSummary } from '../dashboard.types';
import type { DashboardRoutineGroup } from '../dashboard.types';
import { StudyUniversityService } from '../../study-university/study-university.service';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function getTodayDayKey(): (typeof DAY_KEYS)[number] {
  const d = new Date().getDay();
  return DAY_KEYS[d === 0 ? 6 : d - 1];
}

@Injectable()
export class WorkspaceSummaryProvider {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly routineTemplatesService: RoutineTemplatesService,
    private readonly studyUniversityService: StudyUniversityService,
  ) {}

  async getSummaries(
    userId: string,
    workspaceIds: string[],
  ): Promise<DashboardWorkspaceSummary[]> {
    const summaries: DashboardWorkspaceSummary[] = [];
    const studyWorkspaceIds: string[] = [];
    const todayKey = getTodayDayKey();
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);

    for (const workspaceId of workspaceIds) {
      const workspace = await this.workspacesService.findOne(workspaceId, userId);
      if (workspace.workspaceType === 'study' || workspace.workspaceType === 'university') {
        studyWorkspaceIds.push(workspace.id);
      }
      if (!hasRoutineCapability(workspace.workspaceType)) continue;
      const template = await this.routineTemplatesService.findTemplateByWorkspaceId(
        workspace.id,
        userId,
      );
      const override = await this.routineTemplatesService.findOneByWorkspaceAndWeek(
        workspace.id,
        userId,
        year,
        weekNumber,
      );
      const routine = override ?? template;
      if (!routine?.days) continue;
      const dayContent = routine.days[todayKey];
      let groups: DashboardRoutineGroup[] = [];
      if (dayContent?.groups?.length) {
        groups = dayContent.groups.map((g: DayGroup) => ({
          id: g.id,
          title: g.title,
          time: g.time,
          items: Array.isArray(g.items) ? g.items : [],
        }));
      } else {
        const items = dayContent?.items ?? [];
        if (items.length > 0) {
          groups = [{ id: 'default', title: '', items }];
        }
      }
      summaries.push({
        workspaceId: workspace.id,
        workspaceTitle: workspace.name,
        kind: 'routine_today',
        data: { dayKey: todayKey, groups },
      });
    }
    if (studyWorkspaceIds.length > 0) {
      const studySummaries = await this.studyUniversityService.getWorkspaceSummaries(
        userId,
        studyWorkspaceIds,
      );
      summaries.push(...studySummaries);
    }
    return summaries;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
