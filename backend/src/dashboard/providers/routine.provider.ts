import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { RoutineTemplatesService } from '../../routine-templates/routine-templates.service';
import { hasRoutineCapability } from '../../workspace-types/workspace-type.registry';
import type { DayItem, DayGroup } from '../../routine-templates/entities/routine-template.entity';
import type { DashboardRoutineDay, DashboardRoutineGroup } from '../dashboard.types';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

@Injectable()
export class RoutineProvider {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly routineTemplatesService: RoutineTemplatesService,
  ) {}

  async getRoutineDays(
    userId: string,
    year: number,
    weekNumber: number,
    workspaceIds: string[],
  ): Promise<DashboardRoutineDay[]> {
    const routineDays: DashboardRoutineDay[] = [];
    for (const workspaceId of workspaceIds) {
      const workspace = await this.workspacesService.findOne(workspaceId, userId);
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
      for (const dayKey of DAY_KEYS) {
        const dayContent = routine.days[dayKey];
        let items: DayItem[] = dayContent?.items ?? [];
        if (items.length === 0 && dayContent?.blocks?.length) {
          items = dayContent.blocks.map((b, i) => ({
            id: (b as { id?: string }).id ?? `legacy-${i}`,
            type: b.type,
            content: b.content,
          }));
        }
        let groups: DashboardRoutineGroup[] | undefined;
        if (dayContent?.groups?.length) {
          groups = dayContent.groups.map((g: DayGroup) => ({
            id: g.id,
            title: g.title,
            time: g.time,
            items: Array.isArray(g.items) ? g.items : [],
          }));
        } else {
          groups = [
            { id: 'legacy', title: '', items: Array.isArray(items) ? items : [] },
          ];
        }
        routineDays.push({
          workspaceId: workspace.id,
          workspaceTitle: workspace.name,
          dayKey,
          items: Array.isArray(items) ? items : [],
          groups,
        });
      }
    }
    return routineDays;
  }
}
