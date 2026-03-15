"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { drawerOverlay, drawerPanel } from "@/lib/animations";
import { createPrompt } from "@/app/lib/developer-workspace/api/prompts-api";

interface ImportPromptDrawerProps {
  open: boolean;
  onClose: () => void;
  token: string | null;
  onSuccess: () => void;
}

export function ImportPromptDrawer({
  open,
  onClose,
  token,
  onSuccess,
}: ImportPromptDrawerProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setContent("");
      setTitle("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!token) return;
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("El contenido es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const finalTitle = title.trim() || trimmedContent.slice(0, 80).replace(/\n/g, " ");
      await createPrompt(token, {
        title: finalTitle,
        content: trimmedContent,
        status: "active",
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al importar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 flex justify-end bg-black/25"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-drawer-title"
            {...drawerOverlay}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-[var(--dev-surface-elevated)] shadow-xl sm:w-[400px]"
            onClick={(e) => e.stopPropagation()}
            {...drawerPanel}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--dev-border-subtle)] px-4 py-3">
              <h2
                id="import-drawer-title"
                className="text-lg font-semibold text-[var(--app-fg)]"
              >
                {t("importPromptTitle")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
              <div>
                <label
                  htmlFor="import-title"
                  className="mb-1 block text-sm font-medium text-[var(--app-fg)]/80"
                >
                  {t("importPromptTitleLabel")}
                </label>
                <input
                  id="import-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("formTitle")}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <label
                  htmlFor="import-content"
                  className="mb-1 block text-sm font-medium text-[var(--app-fg)]/80"
                >
                  {t("formContent")}
                </label>
                <textarea
                  id="import-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("importPromptPlaceholder")}
                  rows={12}
                  className="min-h-[200px] w-full resize-y rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
                />
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--dev-border-subtle)] px-4 py-3">
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
                disabled={saving || !content.trim()}
                className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Importar"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
