import type { CourseCode, TaskPriority, TaskStatus } from "./tasks-mock-data";

export const COURSE_STYLES: Record<
  CourseCode,
  { badge: string; border: string; chip: string; hoverBorder: string }
> = {
  MAT150: {
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    border: "border-teal-500",
    chip: "bg-teal-500/25 text-teal-200 border-teal-500/40",
    hoverBorder: "hover:border-l-teal-500",
  },
  FIS201: {
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    border: "border-violet-500",
    chip: "bg-violet-500/25 text-violet-200 border-violet-500/40",
    hoverBorder: "hover:border-l-violet-500",
  },
  CS110: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    border: "border-blue-500",
    chip: "bg-blue-500/25 text-blue-200 border-blue-500/40",
    hoverBorder: "hover:border-l-blue-500",
  },
  COM105: {
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    border: "border-orange-500",
    chip: "bg-orange-500/25 text-orange-200 border-orange-500/40",
    hoverBorder: "hover:border-l-orange-500",
  },
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  alta: "bg-red-950/60 text-red-400 border-red-900/50",
  media: "bg-amber-950/50 text-amber-400 border-amber-900/40",
  baja: "bg-zinc-800/80 text-zinc-400 border-zinc-700/50",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  pending: "bg-zinc-800/60 text-zinc-300 border-zinc-600/40",
  in_progress: "bg-amber-950/40 text-amber-300 border-amber-800/40",
  done: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
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
