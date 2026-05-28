import type { Assignment, AssignmentPriority, AssignmentStatus, Course } from "@/app/lib/study-university/types";
import type { StudentTask, TaskPriority, TaskSection, TaskStatus } from "./task-types";

const COLOR_TOKEN_INDEX: Record<string, number> = {
  blue: 1,
  violet: 2,
  emerald: 3,
  amber: 4,
  rose: 5,
  cyan: 6,
  indigo: 3,
  teal: 4,
};

export function courseCodeFromCourse(course: Course): string {
  if (course.code?.trim()) return course.code.trim().toUpperCase();
  const initials = course.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "CUR";
}

export function priorityToUi(p: AssignmentPriority): TaskPriority {
  if (p === "urgent" || p === "high") return "alta";
  if (p === "low") return "baja";
  return "media";
}

export function priorityToBackend(p: TaskPriority): AssignmentPriority {
  if (p === "alta") return "high";
  if (p === "baja") return "low";
  return "medium";
}

export function statusToUi(s: AssignmentStatus): TaskStatus {
  if (s === "done" || s === "submitted") return "done";
  if (s === "in_progress") return "in_progress";
  return "pending";
}

export function statusToBackend(s: TaskStatus): AssignmentStatus {
  if (s === "done") return "done";
  if (s === "in_progress") return "in_progress";
  return "pending";
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function computeSection(deadlineIso: string, status: TaskStatus): TaskSection {
  if (status === "done") return "week";
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(deadlineIso));
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return "urgent";
  if (diffDays <= 7) return "week";
  return "soon";
}

function formatDueLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
}

function toDateIso(deadline: string): string {
  const d = new Date(deadline);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mapAssignmentToStudentTask(
  assignment: Assignment,
  course: Course | undefined,
  locale = "es",
): StudentTask {
  const courseCode = course ? courseCodeFromCourse(course) : "—";
  const status = statusToUi(assignment.status);
  const dueDateIso = toDateIso(assignment.deadline);
  const progress = assignment.progressPercent ?? 0;

  return {
    id: assignment.id,
    assignmentId: assignment.id,
    title: assignment.title,
    courseId: assignment.courseId,
    courseCode,
    courseName: course?.name ?? "Curso",
    courseColorToken: course?.colorToken ?? "blue",
    classSessionId: assignment.classSessionId,
    dueDateLabel: formatDueLabel(assignment.deadline, locale),
    dueDateIso,
    priority: priorityToUi(assignment.priority),
    status,
    backendStatus: assignment.status,
    description: assignment.description ?? "",
    estimatedHours: 1,
    estimatedMinutes: 0,
    section: computeSection(dueDateIso, status),
    progress,
    completedLabel: status === "done" ? formatDueLabel(assignment.deadline, locale) : undefined,
  };
}

export function getCourseStyleIndex(colorToken: string): number {
  return COLOR_TOKEN_INDEX[colorToken] ?? 1;
}

export function getTasksBySection(tasks: StudentTask[], section: TaskSection): StudentTask[] {
  return tasks.filter((t) => t.section === section && t.status !== "done");
}

export function getKanbanTasks(tasks: StudentTask[], columnId: TaskStatus): StudentTask[] {
  return tasks.filter((t) => t.status === columnId);
}

export function buildCalendarWeekDays(weekStart: Date): { iso: string; letter: string; dayNum: number }[] {
  const letters = ["L", "M", "X", "J", "V", "S", "D"];
  const days: { iso: string; letter: string; dayNum: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const iso = toDateIso(d.toISOString());
    days.push({
      iso,
      letter: letters[i] ?? "?",
      dayNum: d.getDate(),
    });
  }
  return days;
}

export function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function tasksToCalendarChips(tasks: StudentTask[]): Record<string, import("./task-types").CalendarChip[]> {
  const byDay: Record<string, import("./task-types").CalendarChip[]> = {};
  for (const task of tasks) {
    const chip = {
      id: `chip-${task.id}`,
      taskId: task.id,
      shortLabel: task.title.length > 18 ? `${task.title.slice(0, 16)}…` : task.title,
      fullTitle: task.title,
      courseCode: task.courseCode,
      dueDateLabel: task.dueDateLabel,
      priority: task.priority,
      estimatedLabel: task.estimatedHours > 0 ? `${task.estimatedHours}h` : "—",
    };
    if (!byDay[task.dueDateIso]) byDay[task.dueDateIso] = [];
    byDay[task.dueDateIso].push(chip);
  }
  return byDay;
}
