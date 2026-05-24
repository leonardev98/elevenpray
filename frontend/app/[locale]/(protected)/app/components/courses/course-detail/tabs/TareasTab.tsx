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
  alta: "border-red-900/50 bg-red-950/50 text-red-300",
  media: "border-amber-900/40 bg-amber-950/40 text-amber-200",
  baja: "border-zinc-700 bg-zinc-800 text-zinc-400",
};

const STATUS_CLASS = {
  pending: "border-zinc-700 bg-zinc-800 text-zinc-400",
  in_progress: "border-amber-800/50 bg-amber-950/30 text-amber-200",
  completed: "border-emerald-800/50 bg-emerald-950/30 text-emerald-300",
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
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tareas del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200"
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
                ? "bg-[var(--app-primary)] text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200",
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
                "overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 transition-[border-color] duration-150 hover:border-l-[3px]",
              )}
              style={{ borderLeftColor: exp ? hex : undefined }}
            >
              <div className="flex items-stretch gap-2 p-3">
                <button
                  type="button"
                  onClick={() => toggleDone(task.id)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-150",
                    done ? "scale-95 border-emerald-500 bg-emerald-500" : "border-zinc-500 bg-transparent",
                  )}
                  aria-pressed={done}
                >
                  {done ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
                </button>
                <div className={cn("min-w-0 flex-1", done && "opacity-60")}>
                  <p className={cn("font-semibold text-white", done && "line-through")}>{task.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {task.dueDate}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", PRIORITY_CLASS[prio])}>
                    {prio === "alta" ? "Alta" : prio === "media" ? "Media" : "Baja"}
                  </span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", STATUS_CLASS[st])}>
                    {STATUS_LABEL[st]}
                    {done ? " ✓" : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId(exp ? null : task.id)}
                  className="self-center p-1 text-zinc-500 hover:text-white"
                  aria-expanded={exp}
                >
                  <ChevronRight className={cn("h-5 w-5 transition-transform", exp && "rotate-90")} />
                </button>
              </div>
              {exp && (
                <div className="border-t border-zinc-800 px-3 pb-3 pt-2">
                  <p className="text-sm text-zinc-400">{task.description ?? "Sin descripción."}</p>
                  <p className="mb-2 mt-3 text-xs text-zinc-500">Progreso manual</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setManualProgress((prev) => ({ ...prev, [task.id]: p }))}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-medium",
                          prog === p ? "bg-[var(--app-primary)] text-white" : "bg-zinc-800 text-zinc-400",
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-zinc-600" style={{ width: `${prog}%` }} />
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
