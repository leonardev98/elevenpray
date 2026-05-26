"use client";

import { useEffect } from "react";
import { Clock, X } from "lucide-react";
import type { TaskStatus } from "../lib/tasks-mock-data";
import { STATUS_LABELS } from "../lib/task-styles";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export function NewTaskModal({ open, onClose, defaultStatus = "pending" }: NewTaskModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nueva tarea"
      onClick={onClose}
    >
      <div
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

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Nombre de la tarea *
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">Curso</label>
            <select className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none">
              <option value="MAT150">MAT150</option>
              <option value="FIS201">FIS201</option>
              <option value="CS110">CS110</option>
              <option value="COM105">COM105</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Fecha límite
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
              Prioridad
            </label>
            <select className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none">
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
              className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--app-fg-muted)]">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Estimación de tiempo
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="horas"
                className="w-24 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
              />
              <input
                type="number"
                min={0}
                max={59}
                placeholder="minutos"
                className="w-24 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">Estado</label>
            <select
              defaultValue={defaultStatus}
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
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Crear tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
