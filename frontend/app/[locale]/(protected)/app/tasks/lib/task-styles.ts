import type { CourseCode, TaskPriority, TaskStatus } from "./tasks-mock-data";

export const COURSE_STYLES: Record<
  CourseCode,
  { badge: string; border: string; chip: string; hoverBorder: string }
> = {
  MAT150: {
    badge: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/30",
    border: "border-[var(--course-1-fg)]",
    chip: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/40",
    hoverBorder: "hover:border-l-[var(--course-1-fg)]",
  },
  FIS201: {
    badge: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/30",
    border: "border-[var(--course-4-fg)]",
    chip: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/40",
    hoverBorder: "hover:border-l-[var(--course-4-fg)]",
  },
  CS110: {
    badge: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)] border-[var(--course-3-fg)]/30",
    border: "border-[var(--course-3-fg)]",
    chip: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)] border-[var(--course-3-fg)]/40",
    hoverBorder: "hover:border-l-[var(--course-3-fg)]",
  },
  COM105: {
    badge: "bg-[var(--course-5-bg)] text-[var(--course-5-fg)] border-[var(--course-5-fg)]/30",
    border: "border-[var(--course-5-fg)]",
    chip: "bg-[var(--course-5-bg)] text-[var(--course-5-fg)] border-[var(--course-5-fg)]/40",
    hoverBorder: "hover:border-l-[var(--course-5-fg)]",
  },
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  alta: "bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)] border-[var(--error)]/30",
  media: "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)] border-[var(--warning)]/30",
  baja: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  pending: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]",
  in_progress: "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)] border-[var(--warning)]/30",
  done: "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  done: "Completada",
};

export function formatEstimatedTime(hours: number, minutes: number): string {
  if (minutes > 0) return `${hours}h ${minutes}min`;
  return `${hours}h`;
}
