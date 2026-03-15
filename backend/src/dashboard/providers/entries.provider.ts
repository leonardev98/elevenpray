import { Injectable } from '@nestjs/common';
import type { DashboardEntry } from '../dashboard.types';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { StudyUniversityService } from '../../study-university/study-university.service';

@Injectable()
export class EntriesProvider {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly studyUniversityService: StudyUniversityService,
  ) {}

  /**
   * Returns entries for the given user, date range, and workspace IDs.
   * Currently returns empty array; can be wired to topic_entries or workspace_entries later.
   */
  async getEntries(
    userId: string,
    from: string,
    to: string,
    workspaceIds: string[],
  ): Promise<DashboardEntry[]> {
    if (workspaceIds.length === 0) return [];
    const workspaces = await Promise.all(
      workspaceIds.map(async (workspaceId) => this.workspacesService.findOne(workspaceId, userId)),
    );
    const studyWorkspaceIds = workspaces
      .filter((w) => w.workspaceType === 'study' || w.workspaceType === 'university')
      .map((w) => w.id);
    if (studyWorkspaceIds.length === 0) return [];
    return this.studyUniversityService.getGlobalDashboardEntries(userId, from, to, studyWorkspaceIds);
  }
}
