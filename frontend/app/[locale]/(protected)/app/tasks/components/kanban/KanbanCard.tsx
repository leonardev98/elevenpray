"use client";

import { useState } from "react";
import { CalendarDays, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockStudentTask } from "../../lib/tasks-mock-data";
import {
  COURSE_STYLES,
  formatEstimatedTime,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from "../../lib/task-styles";

interface KanbanCardProps {
  task: MockStudentTask;
  barColor: string;
}

export function KanbanCard({ task, barColor }: KanbanCardProps) {
  const [grabbing, setGrabbing] = useState(false);
  const courseStyle = COURSE_STYLES[task.courseCode];
  const timeLabel = formatEstimatedTime(task.estimatedHours, task.estimatedMinutes);
  const progress = task.progress ?? (task.status === "done" ? 100 : 0);

  return (
    <article
      className={cn(
        "student-card cursor-grab space-y-3 p-3 transition-shadow duration-150",
        grabbing && "cursor-grabbing shadow-lg",
      )}
      onMouseDown={() => setGrabbing(true)}
      onMouseUp={() => setGrabbing(false)}
      onMouseLeave={() => setGrabbing(false)}
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
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </div>
    </article>
  );
}
