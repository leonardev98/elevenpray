export type TaskPriority = "alta" | "media" | "baja";
export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskSection = "urgent" | "week" | "soon";
export type TaskViewMode = "list" | "kanban" | "calendar";

export type StudentTask = {
  id: string;
  assignmentId: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  courseColorToken: string;
  classSessionId: string | null;
  dueDateLabel: string;
  dueDateIso: string;
  priority: TaskPriority;
  status: TaskStatus;
  backendStatus: string;
  description: string;
  estimatedHours: number;
  estimatedMinutes: number;
  section: TaskSection;
  progress: number;
  completedLabel?: string;
};

export type KanbanColumnId = "pending" | "in_progress" | "done";

export const KANBAN_COLUMNS: {
  id: KanbanColumnId;
  label: string;
  dotColor: string;
  barColor: string;
}[] = [
  { id: "pending", label: "Por hacer", dotColor: "bg-[var(--text-muted)]", barColor: "bg-[var(--text-muted)]" },
  {
    id: "in_progress",
    label: "En progreso",
    dotColor: "bg-[var(--warning)]",
    barColor: "bg-[var(--warning)]",
  },
  { id: "done", label: "Completado", dotColor: "bg-[var(--success)]", barColor: "bg-[var(--success)]" },
];

export const SECTION_CONFIG: {
  id: TaskSection;
  label: string;
  icon: "alert" | "clock" | "calendar";
}[] = [
  { id: "urgent", label: "Urgente — Hoy y mañana", icon: "alert" },
  { id: "week", label: "Esta semana", icon: "clock" },
  { id: "soon", label: "Próximamente", icon: "calendar" },
];

export type CalendarChip = {
  id: string;
  taskId: string;
  shortLabel: string;
  fullTitle: string;
  courseCode: string;
  dueDateLabel: string;
  priority: TaskPriority;
  estimatedLabel: string;
};

export type TaskFilterId = "all" | "pending" | "in_progress" | "done" | TaskPriority;
