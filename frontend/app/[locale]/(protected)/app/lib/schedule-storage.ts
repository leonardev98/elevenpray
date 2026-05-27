import type { MockCourse, MockScheduleEvent } from "./mock-student-data";
import { MOCK_COURSES, MOCK_SCHEDULE_EVENTS } from "./mock-student-data";

const EVENTS_KEY_PREFIX = "mitsyy_schedule_events_";
const COURSES_KEY_PREFIX = "mitsyy_schedule_courses_";

function eventsKey(userId: string): string {
  return `${EVENTS_KEY_PREFIX}${userId}`;
}

function coursesKey(userId: string): string {
  return `${COURSES_KEY_PREFIX}${userId}`;
}

export function loadScheduleEvents(userId: string | null): MockScheduleEvent[] {
  if (typeof window === "undefined" || !userId) return MOCK_SCHEDULE_EVENTS;
  try {
    const raw = localStorage.getItem(eventsKey(userId));
    if (!raw) return MOCK_SCHEDULE_EVENTS;
    const parsed = JSON.parse(raw) as MockScheduleEvent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_SCHEDULE_EVENTS;
  } catch {
    return MOCK_SCHEDULE_EVENTS;
  }
}

export function saveScheduleEvents(userId: string, events: MockScheduleEvent[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(eventsKey(userId), JSON.stringify(events));
}

export function loadScheduleCourses(userId: string | null): MockCourse[] {
  if (typeof window === "undefined" || !userId) return MOCK_COURSES;
  try {
    const raw = localStorage.getItem(coursesKey(userId));
    if (!raw) return MOCK_COURSES;
    const parsed = JSON.parse(raw) as MockCourse[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_COURSES;
  } catch {
    return MOCK_COURSES;
  }
}

export function saveScheduleCourses(userId: string, courses: MockCourse[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(coursesKey(userId), JSON.stringify(courses));
}

export function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
