"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Flag,
  Link2Off,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseTasks, type MockCourseTask } from "../../../../lib/mock-course-data";
import { useCourseClassesStore } from "../../../../lib/course-classes-store";

interface ClassTaskSectionProps {
  classId: string;
  courseId: string;
  linkedTaskId: string | null;
}

export function ClassTaskSection({ classId, courseId, linkedTaskId }: ClassTaskSectionProps) {
  const setLinkedTask = useCourseClassesStore((s) => s.setLinkedTask);
  const [pickerOpen, setPickerOpen] = useState(false);

  const tasks = useMemo(() => getCourseTasks(courseId), [courseId]);
  const linkedTask: MockCourseTask | null = useMemo(() => {
    if (!linkedTaskId) return null;
    return tasks.find((t) => t.id === linkedTaskId) ?? null;
  }, [tasks, linkedTaskId]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tarea de esta clase</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Vincula una tarea para llevar tu entrega organizada
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {linkedTask ? "Cambiar tarea" : "Asignar tarea"}
        </button>
      </div>

      {linkedTask ? (
        <LinkedTaskCard task={linkedTask} onUnlink={() => setLinkedTask(classId, null)} />
      ) : (
        <div className="rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Aún no asignaste una tarea a esta clase.
          </p>
        </div>
      )}

      <AnimatePresence>
        {pickerOpen ? (
          <TaskPicker
            tasks={tasks}
            currentTaskId={linkedTaskId}
            onClose={() => setPickerOpen(false)}
            onPick={(taskId) => {
              setLinkedTask(classId, taskId);
              setPickerOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function LinkedTaskCard({ task, onUnlink }: { task: MockCourseTask; onUnlink: () => void }) {
  const done = task.taskStatus === "completed" || task.done;
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
        ) : (
          <Circle className="h-5 w-5 text-[var(--text-muted)]" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden />
            {task.dueDate}
          </span>
          {task.priority ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                task.priority === "alta"
                  ? "bg-[color-mix(in_srgb,var(--error)_14%,transparent)] text-[var(--error)]"
                  : task.priority === "media"
                    ? "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]"
                    : "bg-[var(--bg-input)] text-[var(--text-muted)]",
              )}
            >
              <Flag className="h-2.5 w-2.5" aria-hidden />
              {task.priority}
            </span>
          ) : null}
          {task.progressPercent !== undefined ? (
            <span className="inline-flex items-center gap-1">
              {task.progressPercent}% completado
            </span>
          ) : null}
        </div>
        {task.description ? (
          <p className="mt-2 text-xs text-[var(--text-body)]">{task.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onUnlink}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
        aria-label="Desvincular tarea"
        title="Desvincular tarea"
      >
        <Link2Off className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function TaskPicker({
  tasks,
  currentTaskId,
  onPick,
  onClose,
}: {
  tasks: MockCourseTask[];
  currentTaskId: string | null;
  onPick: (taskId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [tasks, query]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-label="Cerrar selector"
        className="fixed inset-0 z-[280] bg-black/50"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label="Asignar tarea"
        className="fixed left-1/2 top-1/2 z-[290] flex w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]"
      >
        <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Asignar tarea a esta clase</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una tarea del curso…"
              className="w-full rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] py-1.5 pl-7 pr-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto px-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-[var(--text-muted)]">
              No hay tareas que coincidan.
            </p>
          ) : (
            <ul className="space-y-1 pb-2">
              {filtered.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onPick(t.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left",
                      "hover:bg-[var(--bg-input)]",
                      currentTaskId === t.id && "bg-[var(--accent-subtle)]",
                    )}
                  >
                    {(t.taskStatus === "completed" || t.done) ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--text-primary)]">{t.title}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t.dueDate}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t-[0.5px] border-[var(--border)] px-4 py-3">
          {showCreate ? (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Nueva tarea (rápida)
              </p>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Título de la tarea"
                autoFocus
                className="w-full rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--border-strong)]"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                Nota: las tareas nuevas se vinculan a esta clase, pero la creación completa de
                tareas vive en el tab “Tareas”.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setDraftTitle("");
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!draftTitle.trim()}
                  onClick={() => {
                    const fakeId = `new_${draftTitle.toLowerCase().replace(/\s+/g, "_").slice(0, 20)}`;
                    onPick(fakeId);
                  }}
                  className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)]"
                >
                  Vincular
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Crear una tarea rápida
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
