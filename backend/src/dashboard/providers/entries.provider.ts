import { Injectable } from '@nestjs/common';
import type { DashboardEntry } from '../dashboard.types';

@Injectable()
export class EntriesProvider {
  /**
   * Returns entries for the given user, date range, and workspace IDs.
   * Currently returns empty array; can be wired to topic_entries or workspace_entries later.
   */
  async getEntries(
    _userId: string,
    _from: string,
    _to: string,
    _workspaceIds: string[],
  ): Promise<DashboardEntry[]> {
    return [];
  }
}
