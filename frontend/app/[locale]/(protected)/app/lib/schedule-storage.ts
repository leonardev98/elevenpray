import type { MockScheduleEvent } from "./mock-student-data";

const EVENTS_KEY_PREFIX = "mitsyy_schedule_events_";

const MOCK_EVENT_ID_PATTERN = /^e\d+$/;

function eventsKey(userId: string): string {
  return `${EVENTS_KEY_PREFIX}${userId}`;
}

function isDemoEvent(event: MockScheduleEvent): boolean {
  if (MOCK_EVENT_ID_PATTERN.test(event.id)) return true;
  if (!event.id.startsWith("local-") && /^[ce]\d+$/.test(event.id)) return true;
  return false;
}

export function loadScheduleEvents(userId: string | null): MockScheduleEvent[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(eventsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockScheduleEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => !isDemoEvent(e));
  } catch {
    return [];
  }
}

export function saveScheduleEvents(userId: string, events: MockScheduleEvent[]): void {
  if (typeof window === "undefined") return;
  const localOnly = events.filter((e) => e.id.startsWith("local-") || !isDemoEvent(e));
  localStorage.setItem(eventsKey(userId), JSON.stringify(localOnly));
}

export function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
