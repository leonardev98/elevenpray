import { getAuthHeaders, getBaseUrl } from "../api";

export type ActivityType = "study" | "tasks" | "checkin";

export interface StreakSummaryDto {
  actual: number;
  mejor: number;
  hoy: boolean;
  semana: boolean[];
}

export interface ActivitySummaryDto {
  rachas: {
    estudio: StreakSummaryDto;
    tareas: StreakSummaryDto;
  };
  checkinHoy: boolean;
  xpHoy: number;
  xpMetaDiaria: number;
  xpTareasSemana: number;
}

export async function getActivitySummary(token: string): Promise<ActivitySummaryDto> {
  const res = await fetch(`${getBaseUrl()}/student-activity/summary`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar actividad");
  }
  return res.json();
}

export async function recordActivity(
  token: string,
  type: ActivityType,
  date?: string,
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/student-activity/record`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ type, ...(date ? { date } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al registrar actividad");
  }
}
