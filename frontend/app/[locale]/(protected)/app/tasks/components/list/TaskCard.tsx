"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockStudentTask } from "../../lib/tasks-mock-data";
import {
  COURSE_STYLES,
  formatEstimatedTime,
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "../../lib/task-styles";

const PROGRESS_STEPS = [0, 25, 50, 75, 100];

interface TaskCardProps {
  task: MockStudentTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const [completed, setCompleted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(task.progress ?? 0);
  const [checkAnimating, setCheckAnimating] = useState(false);

  const courseStyle = COURSE_STYLES[task.courseCode];
  const timeLabel = formatEstimatedTime(task.estimatedHours, task.estimatedMinutes);

  function toggleComplete() {
    setCheckAnimating(true);
    setCompleted((c) => !c);
    window.setTimeout(() => setCheckAnimating(false), 200);
  }

  return (
    <article
      className={cn(
        "student-card overflow-hidden border-l-[3px] border-l-transparent transition-all duration-150",
        courseStyle.hoverBorder,
        "hover:bg-[var(--app-surface-soft)]",
      )}
    >
      <div className="flex gap-3 p-4">
        <button
          type="button"
          onClick={toggleComplete}
          aria-label={completed ? "Marcar pendiente" : "Marcar completada"}
          className={cn(
            "mt-0.5 shrink-0 transition-transform duration-200",
            checkAnimating && "animate-task-check",
          )}
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-[var(--app-primary)]" />
          ) : (
            <Circle className="h-5 w-5 text-[var(--app-fg-muted)]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold text-[var(--app-fg)] transition-all duration-200",
              completed && "line-through opacity-60",
            )}
          >
            {task.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium",
                courseStyle.badge,
              )}
            >
              {task.courseCode}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--app-fg-muted)]">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {task.dueDateLabel}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[var(--app-fg-muted)]">
              <Clock className="h-3 w-3" aria-hidden />
              {timeLabel}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 line-clamp-1 text-xs text-[var(--app-fg-muted)]">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                PRIORITY_STYLES[task.priority],
              )}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                STATUS_STYLES[task.status],
              )}
            >
              {STATUS_LABELS[task.status]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
            className="rounded-lg p-1 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded && "rotate-90",
              )}
            />
          </button>
          <button
            type="button"
            aria-label="Más opciones"
            className="rounded-lg p-1 text-[var(--app-fg-muted)]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-200 ease-in-out",
          expanded ? "max-h-[400px]" : "max-h-0",
        )}
      >
        <div className="border-t border-[var(--app-border)] px-4 pb-4 pt-3 pl-12">
          <p className="text-sm text-[var(--app-fg-secondary)]">{task.description}</p>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[var(--app-fg-muted)]">Progreso</span>
              <span className="font-medium text-[var(--app-fg)]">{progress}%</span>
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROGRESS_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setProgress(step)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                    progress === step
                      ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                      : "bg-[var(--app-surface-soft)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]",
                  )}
                >
                  {step}%
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-[var(--app-fg-muted)]">
            Tiempo estimado: {timeLabel}
            {task.reminder && (
              <>
                {" · "}
                Recordatorio: {task.reminder}
              </>
            )}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-surface-soft)] px-3 py-1.5 text-xs text-[var(--app-fg-secondary)]"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Editar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border-[0.5px] border-[var(--error)]/30 px-3 py-1.5 text-xs text-[var(--error)] transition-colors hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
