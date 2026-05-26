"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { useAuth } from "@/app/providers/auth-provider";
import { updateQuestion, type CommunityQuestionDto } from "@/app/lib/community-api";

interface EditQuestionModalProps {
  question: CommunityQuestionDto | null;
  onClose: () => void;
  onUpdated: (q: CommunityQuestionDto) => void;
}

export function EditQuestionModal({
  question,
  onClose,
  onUpdated,
}: EditQuestionModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("");
  const [university, setUniversity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setTitle(question.title);
      setBody(question.body ?? "");
      setCourse(question.course ?? "");
      setUniversity(question.university ?? "");
      setError(null);
    }
  }, [question]);

  useEffect(() => {
    if (!question) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [question, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !token) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateQuestion(token, question.id, {
        title: title.trim(),
        body: body.trim() || undefined,
        course: course.trim() || undefined,
        university: university.trim() || undefined,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {question && (
        <motion.div
          {...modalBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Editar pregunta"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            className="relative w-full max-w-lg rounded-[var(--radius-xl)] border-[0.5px] border-[var(--app-border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--app-fg)]">Editar pregunta</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={300}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  Detalles
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                    Curso
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    maxLength={120}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                    Universidad
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-[var(--error)]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-[var(--radius-md)] border border-[var(--app-border)] px-[18px] py-[10px] text-sm font-medium text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-soft)] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
