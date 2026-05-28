import { getAuthHeaders, getBaseUrl } from "./api";
import type { MoodFactorId, MoodId } from "./emotional-checkins-types";

export interface EmotionalCheckInDto {
  mood: MoodId;
  factors: MoodFactorId[];
  note: string | null;
  checkInDate: string;
}

export interface EmotionalHistoryEntry {
  checkInDate: string;
  mood: MoodId;
  factors: string[];
}

export interface EmotionalSummaryDto {
  streak: number;
  week: (MoodId | null)[];
  insights: string[];
}

export async function getTodayEmotionalCheckIn(
  token: string,
): Promise<EmotionalCheckInDto | null> {
  const res = await fetch(`${getBaseUrl()}/emotional-checkins/today`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar check-in");
  }
  const data = await res.json();
  if (!data || !data.mood) return null;
  return data as EmotionalCheckInDto;
}

export async function upsertTodayEmotionalCheckIn(
  token: string,
  payload: { mood: MoodId; factors?: MoodFactorId[]; note?: string },
): Promise<EmotionalCheckInDto> {
  const res = await fetch(`${getBaseUrl()}/emotional-checkins/today`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al guardar check-in");
  }
  return res.json();
}

export async function getEmotionalCheckInHistory(
  token: string,
  from?: string,
  to?: string,
): Promise<EmotionalHistoryEntry[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const res = await fetch(
    `${getBaseUrl()}/emotional-checkins/history${qs ? `?${qs}` : ""}`,
    { headers: getAuthHeaders(token), cache: "no-store" },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar historial");
  }
  return res.json();
}

export async function getEmotionalCheckInSummary(
  token: string,
): Promise<EmotionalSummaryDto> {
  const res = await fetch(`${getBaseUrl()}/emotional-checkins/summary`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar resumen");
  }
  return res.json();
}
