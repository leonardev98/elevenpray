"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOPIC_TYPES, type TopicTypeId } from "./topic-types";

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: TopicTypeId, description?: string) => Promise<void>;
  error: string | null;
}

export function NewTopicModal({
  isOpen,
  onClose,
  onSubmit,
  error,
}: NewTopicModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function handleExitComplete() {
    document.body.style.overflow = "";
  }

  useEffect(() => {
    if (isOpen) {
      titleRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLInputElement)?.value.trim() || undefined;
    const typeRadio = form.querySelector<HTMLInputElement>('input[name="type"]:checked');
    const type = (typeRadio?.value ?? "rutina") as TopicTypeId;
    if (!title) return;
    setSubmitting(true);
    try {
      await onSubmit(title, type, description);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-topic-title"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            className="w-full max-w-md rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="new-topic-title"
              className="text-xl font-semibold tracking-normal text-[var(--app-fg)]"
            >
              Nuevo tópico
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="new-topic-name"
                className="mb-1 block text-sm font-medium text-[var(--app-fg)]/80"
              >
                Nombre
              </label>
              <input
                ref={titleRef}
                id="new-topic-name"
                name="title"
                type="text"
                required
                placeholder="Ej. Rutina de gym"
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
              />
            </div>
            <div>
              <label
                htmlFor="new-topic-desc"
                className="mb-1 block text-sm font-medium text-[var(--app-fg)]/80"
              >
                Descripción (opcional)
              </label>
              <input
                id="new-topic-desc"
                name="description"
                type="text"
                placeholder="Breve descripción"
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
              />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                Tipo
              </span>
              <div className="flex flex-wrap gap-2">
                {TOPIC_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition has-[:checked]:border-[var(--app-navy)] has-[:checked]:bg-[var(--app-navy)]/15 has-[:checked]:text-[var(--app-fg)] border-[var(--app-border)] text-[var(--app-fg)]/90 hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-bg)]"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.id}
                      defaultChecked={t.id === "rutina"}
                      className="sr-only"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Creando…" : "Crear"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                Cancelar
              </button>
            </div>
          </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
