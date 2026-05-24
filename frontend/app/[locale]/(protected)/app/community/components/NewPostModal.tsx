"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileDown, FileText, HelpCircle, LayoutTemplate, X } from "lucide-react";
import type { PostType } from "../community-types";
import { MODAL_BORDER_BY_TYPE } from "../community-constants";
import { modalBackdrop, modalPanel } from "@/lib/animations";

const CONTENT_TYPES: { id: PostType; label: string; icon: typeof FileText }[] = [
  { id: "apunte", label: "Apunte", icon: FileText },
  { id: "pregunta", label: "Pregunta", icon: HelpCircle },
  { id: "plantilla", label: "Plantilla", icon: LayoutTemplate },
  { id: "pdf", label: "Recurso PDF", icon: FileDown },
];

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: PostType;
}

export function NewPostModal({ open, onClose, defaultType = "apunte" }: NewPostModalProps) {
  const [contentType, setContentType] = useState<PostType>(defaultType);

  useEffect(() => {
    if (open) setContentType(defaultType);
  }, [open, defaultType]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...modalBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Nueva publicación"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            className={`relative w-full max-w-lg rounded-2xl border-2 bg-[var(--app-surface)] p-6 shadow-app-modal ${MODAL_BORDER_BY_TYPE[contentType]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--app-fg)]">Nueva publicación</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              placeholder="¿Qué quieres compartir?"
              rows={5}
              className="mb-5 w-full resize-none rounded-lg bg-[var(--app-surface)] text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:outline-none"
            />

            <p className="mb-2 text-xs font-medium text-[var(--app-fg-muted)]">Tipo de contenido</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {CONTENT_TYPES.map(({ id, label, icon: Icon }) => {
                const active = contentType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContentType(id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                        : "border-[var(--app-border)] text-[var(--app-fg-muted)] hover:border-[var(--app-fg-muted)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  Curso relacionado
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cálculo I"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  Universidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: UNI, UPC, PUCP..."
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-[var(--app-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--app-primary-hover)]"
              >
                Publicar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
