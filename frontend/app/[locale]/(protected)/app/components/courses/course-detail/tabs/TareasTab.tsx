"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended, MockCourseTask } from "../../../../lib/mock-course-data";

type Filter = "todas" | "pendientes" | "completadas";

interface TareasTabProps {
  course: MockCourseExtended;
  tasks: MockCourseTask[];
}

function displayStatus(t: MockCourseTask): "pending" | "in_progress" | "completed" {
  if (t.taskStatus) return t.taskStatus;
  if (t.done) return "completed";
  return "pending";
}

const PRIORITY_CLASS = {
  alta: "border-[color-mix(in_srgb,var(--error)_30%,transparent)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]",
  media: "border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
  baja: "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
};

const STATUS_CLASS = {
  pending: "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
  in_progress: "border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
  completed: "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
};

const STATUS_LABEL: Record<"pending" | "in_progress" | "completed", string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
};

export function TareasTab({ course, tasks }: TareasTabProps) {
  const hex = courseHex(course);
  const [list, setList] = useState(tasks);
  const [filter, setFilter] = useState<Filter>("todas");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualProgress, setManualProgress] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    return list.filter((t) => {
      const s = displayStatus(t);
      if (filter === "todas") return true;
      if (filter === "pendientes") return s !== "completed";
      return s === "completed";
    });
  }, [list, filter]);

  function toggleDone(id: string) {
    setList((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextDone = !t.done;
        return {
          ...t,
          done: nextDone,
          taskStatus: nextDone ? ("completed" as const) : t.taskStatus === "completed" ? "pending" : t.taskStatus,
        };
      }),
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Tareas del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          + Nueva tarea
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["todas", "pendientes", "completadas"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
          >
            {f === "todas" ? "Todas" : f === "pendientes" ? "Pendientes" : "Completadas"}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((task) => {
          const st = displayStatus(task);
          const done = st === "completed";
          const prio = task.priority ?? "media";
          const exp = expandedId === task.id;
          const prog = manualProgress[task.id] ?? task.progressPercent ?? 0;
          return (
            <li
              key={task.id}
              className={cn(
                "overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] transition-[border-color] duration-150 hover:border-l-[3px]",
              )}
              style={{ borderLeftColor: exp ? hex : undefined }}
            >
              <div className="flex items-stretch gap-2 p-3">
                <button
                  type="button"
                  onClick={() => toggleDone(task.id)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-150",
                    done
                      ? "scale-95 border-[var(--success)] bg-[var(--success)]"
                      : "border-[var(--border-strong)] bg-transparent",
                  )}
                  aria-pressed={done}
                >
                  {done ? <span className="h-2 w-2 rounded-sm bg-[var(--accent-fg)]" /> : null}
                </button>
                <div className={cn("min-w-0 flex-1", done && "opacity-60")}>
                  <p className={cn("font-semibold text-[var(--text-primary)]", done && "line-through")}>{task.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {task.dueDate}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={cn("rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium", PRIORITY_CLASS[prio])}>
                    {prio === "alta" ? "Alta" : prio === "media" ? "Media" : "Baja"}
                  </span>
                  <span className={cn("rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium", STATUS_CLASS[st])}>
                    {STATUS_LABEL[st]}
                    {done ? " ✓" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId(exp ? null : task.id)}
                  className="self-center p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-expanded={exp}
                >
                  <ChevronRight className={cn("h-5 w-5 transition-transform", exp && "rotate-90")} />
                </button>
              </div>
              {exp && (
                <div className="border-t-[0.5px] border-[var(--border)] px-3 pb-3 pt-2">
                  <p className="text-sm text-[var(--text-body)]">{task.description ?? "Sin descripción."}</p>
                  <p className="mb-2 mt-3 text-xs text-[var(--text-muted)]">Progreso manual</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setManualProgress((prev) => ({ ...prev, [task.id]: p }))}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-medium",
                          prog === p
                            ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                            : "bg-[var(--bg-input)] text-[var(--text-muted)]",
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-input)]">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${prog}%` }} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
