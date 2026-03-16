"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../../providers/auth-provider";
import { getWorkspaceSubtypesByType, type WorkspaceSubtypeApi } from "../../../../lib/workspace-subtypes-api";
import {
  WORKSPACE_PARENT_IDS,
  getWellnessTypeIds,
  getWorkspaceTypeForParent,
  parentUsesSubtypes,
  type WorkspaceTypeId,
  type WorkspaceParentId,
} from "../../../../lib/workspace-type-registry";
import { useWorkspaces } from "./workspaces-provider";
import { cn } from "@/lib/utils";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, workspaceType: WorkspaceTypeId, workspaceSubtypeId?: string | null) => Promise<void>;
  error: string | null;
}

function subtypeCodeToTranslationKey(code: string): string {
  return (code ?? "").toLowerCase().replace(/-/g, "_");
}

export function NewWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  error,
}: NewWorkspaceModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const { workspaces } = useWorkspaces();
  const [submitting, setSubmitting] = useState(false);
  const [selectedParent, setSelectedParent] = useState<WorkspaceParentId | null>(null);
  const [selectedWellnessType, setSelectedWellnessType] = useState<WorkspaceTypeId | null>(null);
  const [subtypes, setSubtypes] = useState<WorkspaceSubtypeApi[]>([]);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState<string | null>(null);

  const t = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("workspaceTypes");
  const tSubtypes = useTranslations("workspaceSubtypes");
  const tDomains = useTranslations("workspaceDomains");

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
    if (!isOpen) {
      setSelectedParent(null);
      setSelectedWellnessType(null);
      setSubtypes([]);
      setSelectedSubtypeId(null);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedParent || !token) return;
    if (parentUsesSubtypes(selectedParent)) {
      const typeCode = getWorkspaceTypeForParent(selectedParent);
      if (typeCode) loadSubtypes(typeCode);
    } else {
      setSubtypes([]);
      setSelectedSubtypeId(null);
    }
  }, [selectedParent, token, loadSubtypes]);

  function handleParentChange(parentId: WorkspaceParentId) {
    setSelectedParent(parentId);
    setSelectedWellnessType(null);
  }

  const wellnessTypeIds = getWellnessTypeIds();

  /** Ya existe un workspace con este tipo (y subtipo si aplica). Solo uno por tipo/subtipo. */
  const alreadyHasThisSelection = ((): boolean => {
    if (!selectedParent) return false;
    if (selectedParent === "wellness") {
      if (!selectedWellnessType) return false;
      return workspaces.some((w) => w.workspaceType === selectedWellnessType);
    }
    const typeCode = getWorkspaceTypeForParent(selectedParent);
    if (!typeCode) return false;
    const subId = selectedSubtypeId ?? null;
    return workspaces.some(
      (w) =>
        w.workspaceType === typeCode &&
        (w.workspaceSubtypeId ?? null) === subId
    );
  })();

  const canSubmit =
    selectedParent &&
    (selectedParent === "wellness" ? !!selectedWellnessType : true) &&
    !alreadyHasThisSelection;

  /** Para wellness: si ya tiene workspace de este tipo, deshabilitar la opción. */
  function hasWellnessType(typeId: WorkspaceTypeId): boolean {
    return workspaces.some((w) => w.workspaceType === typeId);
  }

  /** Para study/work/general: si ya tiene workspace con este subtype. */
  function hasSubtype(subtypeId: string): boolean {
    const typeCode = selectedParent ? getWorkspaceTypeForParent(selectedParent) : null;
    if (!typeCode) return false;
    return workspaces.some(
      (w) => w.workspaceType === typeCode && w.workspaceSubtypeId === subtypeId
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedParent || !canSubmit || alreadyHasThisSelection) return;
    setSubmitting(true);
    try {
      if (selectedParent === "wellness" && selectedWellnessType) {
        await onSubmit("", selectedWellnessType, undefined);
      } else {
        const workspaceType = getWorkspaceTypeForParent(selectedParent);
        if (workspaceType) {
          await onSubmit("", workspaceType, selectedSubtypeId ?? undefined);
        }
      }
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
              className="text-xl font-semibold tracking-normal text-[var(--app-fg)]"
            >
              {t("newWorkspace")}
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Paso 1: Categoría padre */}
              <div>
                <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                  {t("category")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_PARENT_IDS.map((parentId) => (
                    <label
                      key={parentId}
                      className="cursor-pointer rounded-lg border px-3 py-2 text-sm transition has-[:checked]:border-[var(--app-navy)] has-[:checked]:bg-[var(--app-navy)]/15 border-[var(--app-border)] text-[var(--app-fg)]/90 hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-bg)]"
                    >
                      <input
                        type="radio"
                        name="workspaceParent"
                        value={parentId}
                        checked={selectedParent === parentId}
                        className="sr-only"
                        onChange={() => handleParentChange(parentId)}
                      />
                      {tDomains(parentId)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Paso 2: Subtipo según categoría */}
              {selectedParent === "wellness" && (
                <div>
                  <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                    {t("type")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {wellnessTypeIds.map((typeId) => {
                      const disabled = hasWellnessType(typeId);
                      return (
                        <label
                          key={typeId}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm transition border-[var(--app-border)]",
                            disabled
                              ? "cursor-not-allowed opacity-50 text-[var(--app-fg)]/50"
                              : "cursor-pointer has-[:checked]:border-[var(--app-navy)] has-[:checked]:bg-[var(--app-navy)]/15 text-[var(--app-fg)]/90 hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-bg)]"
                          )}
                        >
                          <input
                            type="radio"
                            name="wellnessType"
                            value={typeId}
                            checked={selectedWellnessType === typeId}
                            disabled={disabled}
                            className="sr-only"
                            onChange={() => !disabled && setSelectedWellnessType(typeId)}
                          />
                          {tTypes(typeId)}
                          {disabled && (
                            <span className="ml-1 text-[10px] text-[var(--app-fg)]/50" title={t("alreadyHaveThisType")}>
                              ✓
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedParent && parentUsesSubtypes(selectedParent) && subtypes.length > 0 && (
                <div>
                  <span className="mb-2 block text-sm font-medium text-[var(--app-fg)]/80">
                    {t("subtypeOptional")}
                  </span>
                  <select
                    value={selectedSubtypeId ?? ""}
                    onChange={(e) => setSelectedSubtypeId(e.target.value || null)}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                  >
                    <option value="">{tCommon("none")}</option>
                    {subtypes.map((s) => {
                      const code = subtypeCodeToTranslationKey(s.code);
                      const label = tSubtypes(code) !== code ? tSubtypes(code) : s.label;
                      const alreadyHas = hasSubtype(s.id);
                      return (
                        <option key={s.id} value={s.id} disabled={alreadyHas}>
                          {label}{alreadyHas ? ` (${t("alreadyHaveThisType")})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {alreadyHasThisSelection && (
                <p className="text-sm text-amber-600 dark:text-amber-400" role="alert">
                  {t("alreadyHaveThisType")}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="flex-1 rounded-lg bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? tCommon("creating") : tCommon("create")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
                >
                  {tCommon("cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
