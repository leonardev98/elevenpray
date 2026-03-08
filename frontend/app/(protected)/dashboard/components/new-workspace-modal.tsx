"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../providers/auth-provider";
import { getWorkspaceSubtypesByType, type WorkspaceSubtypeApi } from "../../../lib/workspace-subtypes-api";
import { WORKSPACE_TYPES, type WorkspaceTypeId } from "./topic-types";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, workspaceType: WorkspaceTypeId, workspaceSubtypeId?: string | null) => Promise<void>;
  error: string | null;
}

export function NewWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  error,
}: NewWorkspaceModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [subtypes, setSubtypes] = useState<WorkspaceSubtypeApi[]>([]);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<WorkspaceTypeId>("general");

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
    if (isOpen) nameRef.current?.focus();
  }, [isOpen]);

  const loadSubtypes = useCallback(
    async (typeCode: WorkspaceTypeId) => {
      if (!token) return;
      const list = await getWorkspaceSubtypesByType(token, typeCode);
      setSubtypes(list);
      setSelectedSubtypeId(null);
    },
    [token]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelectedType("general");
    setSubtypes([]);
    setSelectedSubtypeId(null);
    loadSubtypes("general");
  }, [isOpen, loadSubtypes]);

  function handleTypeChange(typeCode: WorkspaceTypeId) {
    setSelectedType(typeCode);
    loadSubtypes(typeCode);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const typeRadio = form.querySelector<HTMLInputElement>('input[name="workspaceType"]:checked');
    const workspaceType = (typeRadio?.value ?? "general") as WorkspaceTypeId;
    if (!name) return;
    setSubmitting(true);
    try {
      await onSubmit(name, workspaceType, selectedSubtypeId ?? undefined);
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
          aria-labelledby="new-workspace-title"
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
              id="new-workspace-title"
              className="text-xl font-semibold tracking-tight text-[var(--app-fg)]"
            >
              Nuevo workspace
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="new-workspace-name"
                  className="mb-1 block text-sm font-medium text-[var(--app-fg)]/80"
                >
                  Nombre
                </label>
                <input
                  ref={nameRef}
                  id="new-workspace-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ej. Skincare, Universidad"
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
                />
              </div>
              <div>
                <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                  Tipo
                </span>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_TYPES.map((t) => (
                    <label
                      key={t.id}
                      className="cursor-pointer rounded-lg border px-3 py-2 text-sm transition has-[:checked]:border-[var(--app-gold)] has-[:checked]:bg-[var(--app-gold)]/15 border-[var(--app-border)] text-[var(--app-fg)]/90 hover:border-[var(--app-gold)]/50 hover:bg-[var(--app-bg)]"
                    >
                      <input
                        type="radio"
                        name="workspaceType"
                        value={t.id}
                        defaultChecked={t.id === "general"}
                        className="sr-only"
                        onChange={() => handleTypeChange(t.id)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              {subtypes.length > 0 && (
                <div>
                  <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                    Subtipo (opcional)
                  </span>
                  <select
                    value={selectedSubtypeId ?? ""}
                    onChange={(e) => setSelectedSubtypeId(e.target.value || null)}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
                  >
                    <option value="">Ninguno</option>
                    {subtypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
