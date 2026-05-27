import { format } from "date-fns";
import { enUS, es, type Locale } from "date-fns/locale";
import type { MockCourseExtended } from "./mock-course-data";

const dateFnsLocaleMap: Record<string, Locale> = { es, en: enUS };

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatClassDateLine(iso: string, appLocale = "es"): string {
  const locale = dateFnsLocaleMap[appLocale] ?? es;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const line = format(d, "EEEE d MMMM", { locale });
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export function parseTimeRangeParts(raw: string | null | undefined): {
  start: string;
  end: string;
} {
  const DEFAULT_START = "08:00";
  const DEFAULT_END = "10:00";
  if (!raw || typeof raw !== "string") {
    return { start: DEFAULT_START, end: DEFAULT_END };
  }
  const matches = raw.match(/\b(\d{1,2}):(\d{2})\b/g);
  if (!matches?.length) {
    return { start: DEFAULT_START, end: DEFAULT_END };
  }
  const normalize = (s: string): string | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (!m) return null;
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  const start = normalize(matches[0]) ?? DEFAULT_START;
  let end = matches[1] ? (normalize(matches[1]) ?? DEFAULT_END) : DEFAULT_END;
  if (end <= start) {
    end = addOneHour(start);
  }
  return { start, end };
}

export function formatTimeRangeDisplay(start: string, end: string): string {
  if (!start?.trim() || !end?.trim()) return "—";
  return `${start} - ${end}`;
}

export function addOneHour(time: string): string {
  const [h = 9, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + 60;
  const nh = Math.min(Math.floor(total / 60), 23);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function isValidTimeOrder(start: string, end: string): boolean {
  return Boolean(start && end && end > start);
}

/** Horario por defecto al crear una clase, tomado del curso si existe. */
export function getDefaultClassSchedule(course: MockCourseExtended): {
  start: string;
  end: string;
} {
  const start = course.scheduleStart?.trim();
  const end = course.scheduleEnd?.trim();
  if (start && end && isValidTimeOrder(start, end)) {
    return { start, end };
  }
  const slot = course.scheduleSlots?.find((s) => s.start?.trim() && s.end?.trim());
  if (slot && isValidTimeOrder(slot.start, slot.end)) {
    return { start: slot.start.trim(), end: slot.end.trim() };
  }
  return { start: "08:00", end: "10:00" };
}

export function buildNewClassDateFields(
  course: MockCourseExtended,
  appLocale = "es",
): { dateIso: string; dateLine: string; timeRange: string } {
  const dateIso = todayIso();
  const { start, end } = getDefaultClassSchedule(course);
  return {
    dateIso,
    dateLine: formatClassDateLine(dateIso, appLocale),
    timeRange: formatTimeRangeDisplay(start, end),
  };
}
