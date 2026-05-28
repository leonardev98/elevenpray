"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentTask } from "../../lib/task-types";
import {
  formatEstimatedTime,
  getCourseStyle,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from "../../lib/task-styles";

interface KanbanCardProps {
  task: StudentTask;
  barColor: string;
  isOverlay?: boolean;
}

export function KanbanCard({ task, barColor, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const courseStyle = getCourseStyle(task.courseColorToken);
  const timeLabel = formatEstimatedTime(task.estimatedHours, task.estimatedMinutes);
  const progress = task.progress ?? (task.status === "done" ? 100 : 0);

  return (
    <motion.article
      ref={isOverlay ? undefined : setNodeRef}
      layout={!isOverlay}
      style={style}
      {...(isOverlay ? {} : { ...listeners, ...attributes })}
      className={cn(
        "student-card space-y-3 p-3 touch-none",
        !isOverlay && "cursor-grab active:cursor-grabbing",
        (isDragging || isOverlay) && "shadow-lg ring-1 ring-[var(--app-primary)]/20 opacity-95",
        isOverlay && "rotate-1",
      )}
      whileHover={isOverlay ? undefined : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <span
        className={cn(
          "inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium",
          courseStyle.badge,
        )}
      >
        {task.courseCode}
      </span>

      <p className="text-sm font-semibold text-[var(--app-fg)]">{task.title}</p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[10px] text-[var(--app-fg-muted)]">
          <CalendarDays className="h-3 w-3" aria-hidden />
          {task.dueDateLabel}
        </span>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            PRIORITY_STYLES[task.priority],
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--app-fg-muted)]">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {timeLabel}
        </span>
        <span>{progress}%</span>
      </div>
    </motion.article>
  );
}
