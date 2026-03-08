import { getBaseUrl, getAuthHeaders } from "./api";

export interface DashboardRoutineGroup {
  id: string;
  title: string;
  time?: string;
  items: { id: string; type: string; content: string }[];
}

export interface DashboardRoutineDay {
  workspaceId: string;
  workspaceTitle: string;
  dayKey: string;
  items: { id: string; type: string; content: string }[];
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

export interface DashboardWeekResponse {
  year: number;
  weekNumber: number;
  from: string;
  to: string;
  routineDays: DashboardRoutineDay[];
  entries: DashboardEntry[];
}

export type DashboardScope = "all" | "favorites" | "selected" | "current";

export interface DashboardWeekQueryBody {
  year: number;
  week: number;
  scope?: DashboardScope;
  workspaceIds?: string[];
}

export async function getDashboardWeek(
  token: string,
  year: number,
  week: number,
  signal?: AbortSignal
): Promise<DashboardWeekResponse> {
  const url = `${getBaseUrl()}/dashboard/week?year=${year}&week=${week}`;
  const res = await fetch(url, { headers: getAuthHeaders(token), signal });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Error al cargar el dashboard");
  return res.json();
}

export async function getDashboardWeekQuery(
  token: string,
  body: DashboardWeekQueryBody,
  signal?: AbortSignal
): Promise<DashboardWeekResponse> {
  const res = await fetch(`${getBaseUrl()}/dashboard/week/query`, {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Error al cargar el dashboard");
  return res.json();
}
