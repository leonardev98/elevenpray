import type { DayItem } from '../routine-templates/entities/routine-template.entity';

export interface DashboardRoutineGroup {
  id: string;
  title: string;
  time?: string;
  items: DayItem[];
}

export interface DashboardRoutineDay {
  workspaceId: string;
  workspaceTitle: string;
  dayKey: string;
  items: DayItem[];
  groups?: DashboardRoutineGroup[];
}

export interface DashboardEntry {
  id: string;
  workspaceId: string;
  workspaceTitle: string;
  entryDate: string;
  content: string | null;
  imageUrl: string | null;
}

export interface DashboardWeekDto {
  year: number;
  weekNumber: number;
  from: string;
  to: string;
  routineDays: DashboardRoutineDay[];
  entries: DashboardEntry[];
}
