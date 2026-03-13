"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "../../../../providers/auth-provider";
import { useWorkspaces } from "../components/workspaces-provider";
import {
  getWorkspaceType,
  getWorkspaceCategoryLabel,
  hasRoutineCapability,
} from "../../../../lib/workspace-type-registry";
import { updateWorkspace } from "../../../../lib/workspaces-api";
import type { WorkspaceApi } from "../../../../lib/workspaces-api";
import { getUiState, updateUiState } from "../../../../lib/workspace-preferences-api";

export default function RoutinesPage() {
  const { token } = useAuth();
  const { workspaces, removeWorkspace, refreshWorkspaces } = useWorkspaces();
  const [activeRoutineWorkspaceId, setActiveRoutineWorkspaceId] = useState<string | null>(null);
  const [loadingUiState, setLoadingUiState] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = useTranslations("routines");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("workspaceTypes");

  const workspacesWithRoutine = workspaces.filter((w) =>
    hasRoutineCapability(w.workspaceType)
  );

  useEffect(() => {
    if (!token) return;
    getUiState(token)
      .then((s) => setActiveRoutineWorkspaceId(s.activeRoutineWorkspaceId ?? null))
      .catch(() => setActiveRoutineWorkspaceId(null))
      .finally(() => setLoadingUiState(false));
  }, [token]);

  const handleSetActive = useCallback(
    async (workspaceId: string) => {
      if (!token) return;
      setActivatingId(workspaceId);
      setError("");
      try {
        await updateUiState(token, { activeRoutineWorkspaceId: workspaceId });
        setActiveRoutineWorkspaceId(workspaceId);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorActivating"));
      } finally {
        setActivatingId(null);
      }
    },
    [token]
  );

  const handleEditStart = useCallback((w: WorkspaceApi) => {
    setEditId(w.id);
    setEditName(w.name);
  }, []);

  const handleEditSave = useCallback(
    async (workspaceId: string) => {
      if (!token || editName.trim() === "") return;
      setSaving(true);
      setError("");
      try {
        await updateWorkspace(token, workspaceId, { name: editName.trim() });
        await refreshWorkspaces();
        setEditId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorSavingName"));
      } finally {
        setSaving(false);
      }
    },
    [token, editName, refreshWorkspaces, t]
  );

  const handleEditCancel = useCallback(() => {
    setEditId(null);
    setEditName("");
  }, []);

  const handleDelete = useCallback(
    async (w: WorkspaceApi) => {
      if (!token) return;
      if (!window.confirm(t("confirmDeleteRoutine"))) return;
      setDeletingId(w.id);
      setError("");
      try {
        if (activeRoutineWorkspaceId === w.id) {
          await updateUiState(token, { activeRoutineWorkspaceId: null });
          setActiveRoutineWorkspaceId(null);
        }
        await removeWorkspace(w.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("errorDeleting"));
      } finally {
        setDeletingId(null);
      }
    },
    [token, activeRoutineWorkspaceId, removeWorkspace, t]
  );

  const loading = workspaces.length === 0; // initial load from provider
  if (loading && workspacesWithRoutine.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
        {t("myRoutines")}
      </h1>
      <p className="mt-1 text-sm text-[var(--app-fg)]/60">
        {t("openTemplate")}
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspacesWithRoutine.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-[var(--app-border)] py-12 text-center text-[var(--app-fg)]/50">
            {t("noWorkspacesWithRoutine")}
          </div>
        )}
        {workspacesWithRoutine.map((w) => {
          const typeDef = getWorkspaceType(w.workspaceType);
          const typeLabel = typeDef ? tTypes(w.workspaceType) : w.workspaceType;
          const categoryLabel = typeDef ? getWorkspaceCategoryLabel(typeDef.category) : "";
          const isActive = activeRoutineWorkspaceId === w.id;
          const isEditing = editId === w.id;
          const isDeleting = deletingId === w.id;
          const isActivating = activatingId === w.id;

          return (
            <article
              key={w.id}
              className={`flex flex-col rounded-2xl border bg-[var(--app-surface)] p-5 shadow-sm transition hover:shadow-md ${
                isActive ? "border-[var(--app-navy)] ring-1 ring-[var(--app-navy)]/30" : "border-[var(--app-border)] hover:border-[var(--app-navy)]/30"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  {isEditing ? (
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(w.id);
                          if (e.key === "Escape") handleEditCancel();
                        }}
                        className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-lg font-semibold text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                        autoFocus
                        aria-label={t("editName")}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSave(w.id)}
                          disabled={saving || !editName.trim()}
                          className="rounded-lg bg-[var(--app-navy)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? t("saving") : t("save")}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          disabled={saving}
                          className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
                        >
                          {tCommon("cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="truncate text-lg font-semibold text-[var(--app-fg)]">
                        {w.name}
                      </h2>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditStart(w)}
                          className="rounded-lg p-1.5 text-[var(--app-fg)]/50 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
                          aria-label={t("editName")}
                          title={t("editName")}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(w)}
                          disabled={isDeleting}
                          className="rounded-lg p-1.5 text-[var(--app-fg)]/50 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                          aria-label={t("deleteRoutine")}
                          title={t("deleteRoutine")}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V7a1 1 0 00-1-1h-4a1 1 0 00-1 1v4" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-[var(--app-fg)]/60">
                  <span className="rounded-md bg-[var(--app-bg)] px-2 py-0.5 font-medium text-[var(--app-fg)]/80">
                    {typeLabel}
                  </span>
                  {categoryLabel && (
                    <span className="text-[var(--app-fg)]/50">{categoryLabel}</span>
                  )}
                </p>
              </div>
              <div className="mt-4 flex flex-shrink-0 flex-wrap items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSetActive(w.id)}
                      disabled={isActive || isActivating}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "cursor-default border border-[var(--app-navy)] bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
                          : "border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)] hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)]"
                      }`}
                    >
                      {isActivating ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                      ) : isActive ? (
                        t("active")
                      ) : (
                        t("activate")
                      )}
                    </button>
                    <Link
                      href={`/dashboard/workspaces/${w.id}/routine`}
                      className="inline-flex w-full flex-1 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] transition hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)] sm:w-auto"
                    >
                      {t("openRoutine")}
                    </Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
