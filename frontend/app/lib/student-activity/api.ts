import { getAuthHeaders, getBaseUrl } from "../api";
import { normalizeActivitySummary } from "./normalize-summary";

export type ActivityType = "study" | "tasks" | "checkin";

export interface StreakSummaryDto {
  actual: number;
  mejor: number;
  hoy: boolean;
  semana: boolean[];
}

export interface HistorialXpDiaDto {
  dia: string;
  xp: number;
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
  totalXp: number;
  nivel: number;
  titulo: string;
  tituloSiguienteNivel: string;
  xpActual: number;
  xpSiguienteNivel: number;
  historialXP: HistorialXpDiaDto[];
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
  const raw = (await res.json()) as ActivitySummaryDto;
  return normalizeActivitySummary(raw);
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

export async function recordBonusXp(
  token: string,
  amount: number,
  source: string,
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/student-activity/xp`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ amount, source }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al registrar XP");
  }
}
