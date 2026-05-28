import { addDays, format } from "date-fns";
import type {
  Assignment,
  ClassSession,
  Course,
  GradeItem,
  UniversityWorkspaceState,
} from "@/app/lib/study-university/types";
import { courseCodeFromCourse } from "../tasks/lib/map-assignment";
import type { CalendarEvent } from "./calendar-event-types";
import type { MockScheduleEvent } from "./mock-student-data";

function toDateIso(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateInRange(dateKey: string, rangeStart: string, rangeEnd: string): boolean {
  return dateKey >= rangeStart && dateKey <= rangeEnd;
}

function courseById(courses: Course[]): Map<string, Course> {
  return new Map(courses.map((c) => [c.id, c]));
}

export function buildSessionEvents(
  sessions: ClassSession[],
  courses: Course[],
  rangeStart: string,
  rangeEnd: string,
): CalendarEvent[] {
  const coursesMap = courseById(courses);
  return sessions
    .filter((s) => dateInRange(s.sessionDate, rangeStart, rangeEnd))
    .map((session) => {
      const course = coursesMap.get(session.courseId);
      const code = course ? courseCodeFromCourse(course) : "";
      return {
        id: `session-${session.id}`,
        source: "session" as const,
        kind: "class" as const,
        date: session.sessionDate,
        title: course?.name ?? session.title ?? "Clase",
        subtitle: [
          session.title ?? session.classroom ?? code,
          session.hasNotes ? "Notas" : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
        startTime: session.startTime.slice(0, 5),
        endTime: session.endTime.slice(0, 5),
        courseId: session.courseId,
        readOnly: true,
        href: course ? `/app/courses/${session.courseId}?tab=clases` : undefined,
      };
    });
}

export function buildAssignmentEvents(
  assignments: Assignment[],
  courses: Course[],
  rangeStart: string,
  rangeEnd: string,
): CalendarEvent[] {
  const coursesMap = courseById(courses);
  const events: CalendarEvent[] = [];
  for (const assignment of assignments) {
    const date = toDateIso(assignment.deadline);
    if (!dateInRange(date, rangeStart, rangeEnd)) continue;
    const course = coursesMap.get(assignment.courseId);
    const code = course ? courseCodeFromCourse(course) : "";
    events.push({
      id: `assignment-${assignment.id}`,
      source: "assignment",
      kind: "task",
      date,
      title: assignment.title,
      subtitle: code || course?.name,
      startTime: "23:00",
      endTime: "23:30",
      courseId: assignment.courseId,
      readOnly: true,
      href: `/app/tasks?highlight=${assignment.id}`,
    });
  }
  return events;
}

export function buildExamEvents(
  gradeItems: GradeItem[],
  courses: Course[],
  rangeStart: string,
  rangeEnd: string,
): CalendarEvent[] {
  const coursesMap = courseById(courses);
  return gradeItems
    .filter((g) => g.type === "exam" && g.gradeDate)
    .filter((g) => dateInRange(g.gradeDate!, rangeStart, rangeEnd))
    .map((exam) => {
      const course = coursesMap.get(exam.courseId);
      const code = course ? courseCodeFromCourse(course) : "";
      return {
        id: `exam-${exam.id}`,
        source: "exam" as const,
        kind: "exam" as const,
        date: exam.gradeDate!,
        title: exam.name,
        subtitle: code || course?.name,
        startTime: "09:00",
        endTime: "10:00",
        courseId: exam.courseId,
        readOnly: true,
        href: `/app/courses/${exam.courseId}?tab=examenes`,
      };
    });
}

export function localEventsToCalendar(events: MockScheduleEvent[]): CalendarEvent[] {
  return events
    .filter((e) => e.id.startsWith("local-") || !e.id.match(/^(e\d+|session-|assignment-|exam-)/))
    .map((e) => ({
      ...e,
      id: e.id.startsWith("local-") ? e.id : `local-${e.id}`,
      source: "local" as const,
      readOnly: false,
    }));
}

export function buildBackendCalendarEvents(
  state: UniversityWorkspaceState,
  weekStart: Date,
): CalendarEvent[] {
  const rangeStart = format(weekStart, "yyyy-MM-dd");
  const rangeEnd = format(addDays(weekStart, 6), "yyyy-MM-dd");
  const { courses, sessions, assignments, gradeItems } = state;

  return [
    ...buildSessionEvents(sessions, courses, rangeStart, rangeEnd),
    ...buildAssignmentEvents(assignments, courses, rangeStart, rangeEnd),
    ...buildExamEvents(gradeItems, courses, rangeStart, rangeEnd),
  ];
}

export function mergeCalendarEvents(
  backend: CalendarEvent[],
  local: CalendarEvent[],
): CalendarEvent[] {
  return [...backend, ...local].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function buildTodayDashboardEvents(state: UniversityWorkspaceState, today: string): {
  classesToday: CalendarEvent[];
  upcomingTasks: CalendarEvent[];
} {
  const classesToday = buildSessionEvents(state.sessions, state.courses, today, today).sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  const upcomingTasks: CalendarEvent[] = [];
  for (const assignment of state.assignments) {
    if (assignment.status === "done" || assignment.status === "submitted") continue;
    const date = toDateIso(assignment.deadline);
    if (date < today) continue;
    const course = state.courses.find((c) => c.id === assignment.courseId);
    const code = course ? courseCodeFromCourse(course) : "";
    upcomingTasks.push({
      id: `assignment-${assignment.id}`,
      source: "assignment",
      kind: "task",
      date,
      title: assignment.title,
      subtitle: code || course?.name,
      startTime: "23:00",
      endTime: "23:30",
      courseId: assignment.courseId,
      readOnly: true,
      href: `/app/tasks?highlight=${assignment.id}`,
    });
  }
  upcomingTasks.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.startTime.localeCompare(b.startTime);
  });
  const upcomingTasksTop = upcomingTasks.slice(0, 5);

  return { classesToday, upcomingTasks: upcomingTasksTop };
}
