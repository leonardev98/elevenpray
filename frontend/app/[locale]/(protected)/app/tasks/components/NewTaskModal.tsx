"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { courseCodeFromCourse } from "../lib/map-assignment";
import type { TaskPriority, TaskStatus } from "../lib/task-types";
import { STATUS_LABELS } from "../lib/task-styles";
import { useStudentTasks } from "../context/student-tasks-context";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
  defaultCourseId?: string;
  defaultClassSessionId?: string | null;
}

export function NewTaskModal({
  open,
  onClose,
  defaultStatus = "pending",
  defaultCourseId,
  defaultClassSessionId = null,
}: NewTaskModalProps) {
  const { courses, createTask } = useStudentTasks();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
      setError(null);
      if (defaultCourseId) setCourseId(defaultCourseId);
      else if (courses[0]) setCourseId(courses[0].id);
    }
  }, [open, defaultStatus, defaultCourseId, courses]);

  if (!open) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !deadline) {
      setError("Selecciona curso y fecha límite.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const deadlineIso = new Date(`${deadline}T23:59:59`).toISOString();
      await createTask({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadlineIso,
        priority,
        status,
        classSessionId: defaultClassSessionId,
      });
      setTitle("");
      setDescription("");
      setDeadline("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la tarea");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva tarea"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">Nueva tarea</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm text-[var(--error)]" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Nombre de la tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">Curso</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              disabled={courses.length === 0}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            >
              {courses.length === 0 ? (
                <option value="">Sin cursos — crea uno en Estudios</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {courseCodeFromCourse(c)} — {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Fecha límite *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Descripción (opcional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--app-fg-muted)]">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Estado inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-transparent px-[18px] py-[10px] text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || courses.length === 0}
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {submitting ? "Creando…" : "Crear tarea"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
