import { getAuthHeaders, getBaseUrl } from "./api";

export type DayEntryType = "checkin" | "breathing" | "pomodoro" | "journal" | "sos";

export interface DayEntryDto {
  id: string;
  entryDate: string;
  entryType: DayEntryType;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export interface CreateDayEntryPayload {
  entryType: DayEntryType;
  payload?: Record<string, unknown>;
  entryDate?: string;
}

export async function createDayEntry(
  token: string,
  body: CreateDayEntryPayload,
): Promise<DayEntryDto> {
  const res = await fetch(`${getBaseUrl()}/day-entries`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al crear entrada");
  }
  return res.json();
}

export async function getDayEntries(token: string, date?: string): Promise<DayEntryDto[]> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  const res = await fetch(`${getBaseUrl()}/day-entries${qs}`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar entradas");
  }
  return res.json();
}

export async function getDatesWithEntries(
  token: string,
  from?: string,
  to?: string,
): Promise<string[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const res = await fetch(`${getBaseUrl()}/day-entries/dates-with-entries${qs ? `?${qs}` : ""}`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar fechas");
  }
  return res.json();
}
