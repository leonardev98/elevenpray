"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { createPromptFolder } from "@/app/lib/developer-workspace";

interface NewFolderDrawerProps {
  open: boolean;
  onClose: () => void;
  token: string | null;
  onSuccess: () => void;
}

export function NewFolderDrawer({
  open,
  onClose,
  token,
  onSuccess,
}: NewFolderDrawerProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!token) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createPromptFolder(token, { name: trimmed });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear carpeta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/25 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-folder-title"
          {...modalBackdrop}
        >
          <motion.div
            className="w-full max-w-md rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
        <div className="flex items-center justify-between pb-3">
          <h2 id="new-folder-title" className="text-lg font-semibold text-[var(--app-fg)]">
            {t("newFolder")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Trabajo, Backend"
          disabled={saving}
          className="mb-4 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--app-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-surface)]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creando…" : "Crear"}
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
