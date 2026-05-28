import type { ScheduleEventKind, MockScheduleEvent } from "./mock-student-data";

export type CalendarEventSource = "session" | "assignment" | "exam" | "local";

export type CalendarEvent = MockScheduleEvent & {
  source: CalendarEventSource;
  readOnly: boolean;
  href?: string;
};

export function isLocalCalendarEventId(id: string): boolean {
  return id.startsWith("local-");
}

export function parseCalendarEventId(id: string): { source: CalendarEventSource; rawId: string } | null {
  if (id.startsWith("local-")) return { source: "local", rawId: id.slice(6) };
  if (id.startsWith("session-")) return { source: "session", rawId: id.slice(8) };
  if (id.startsWith("assignment-")) return { source: "assignment", rawId: id.slice(11) };
  if (id.startsWith("exam-")) return { source: "exam", rawId: id.slice(5) };
  return null;
}

export function calendarEventKindFromSource(source: CalendarEventSource): ScheduleEventKind {
  if (source === "session") return "class";
  if (source === "assignment") return "task";
  if (source === "exam") return "exam";
  return "extra";
}
