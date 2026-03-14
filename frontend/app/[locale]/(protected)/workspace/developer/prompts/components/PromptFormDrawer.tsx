"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { drawerOverlay, drawerPanel } from "@/lib/animations";
import { PromptForm, getDefaultValues, type PromptFormValues } from "./PromptForm";
import type { PromptApi, PromptFolderApi, PromptCategoryApi, DeveloperProjectApi } from "@/app/lib/developer-workspace/types";

interface PromptFormDrawerProps {
  open: boolean;
  onClose: () => void;
  prompt: PromptApi | null;
  folders: PromptFolderApi[];
  categories: PromptCategoryApi[];
  projects: DeveloperProjectApi[];
  tagSuggestions: string[];
  token: string | null;
  onSuccess: () => void;
}

export function PromptFormDrawer({
  open,
  onClose,
  prompt,
  folders,
  categories,
  projects,
  tagSuggestions,
  token,
  onSuccess,
}: PromptFormDrawerProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<PromptFormValues>(() =>
    getDefaultValues(prompt)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(getDefaultValues(prompt));
      setError(null);
    }
  }, [open, prompt]);

  const handleSubmit = async () => {
    if (!token) return;
    if (!values.title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!values.content.trim()) {
      setError("El contenido es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const api = await import("@/app/lib/developer-workspace/api/prompts-api");
      if (prompt) {
        await api.updatePrompt(token, prompt.id, {
          title: values.title,
          slug: values.slug || undefined,
          description: values.description || undefined,
          content: values.content,
          folderId: values.folderId,
          categoryId: values.categoryId,
          projectId: values.projectId,
          repositoryName: values.repositoryName || null,
          status: values.status,
          isFavorite: values.isFavorite,
          isPinned: values.isPinned,
          tagNames: values.tagNames,
        });
      } else {
        await api.createPrompt(token, {
          title: values.title,
          slug: values.slug || undefined,
          description: values.description,
          content: values.content,
          folderId: values.folderId || undefined,
          categoryId: values.categoryId || undefined,
          projectId: values.projectId || undefined,
          repositoryName: values.repositoryName || undefined,
          status: values.status,
          isFavorite: values.isFavorite,
          isPinned: values.isPinned,
          tagNames: values.tagNames,
        });
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async (name: string) => {
    if (!token) return;
    try {
      const api = await import("@/app/lib/developer-workspace/api/prompts-api");
      await api.createPromptTag(token, { name: name.trim().toLowerCase() });
    } catch {
      // tag may already exist
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
            aria-labelledby="drawer-title"
            {...drawerOverlay}
          />
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-[var(--dev-surface-elevated)] shadow-xl sm:w-[480px]"
            onClick={(e) => e.stopPropagation()}
            {...drawerPanel}
          >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--dev-border-subtle)] px-4 py-3">
          <h2 id="drawer-title" className="text-lg font-semibold text-[var(--app-fg)]">
            {prompt ? t("edit") : t("newPrompt")}
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
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <PromptForm
            value={values}
            onChange={setValues}
            folders={folders}
            categories={categories}
            projects={projects}
            tagSuggestions={tagSuggestions}
            onAddTag={handleAddTag}
            errors={{}}
            disabled={saving}
          />
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
            disabled={saving}
            className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? tCommon("saving") : tCommon("save")}
          </button>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
