"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../../providers/auth-provider";
import { getWorkspace } from "../../../../../lib/workspaces-api";
import { getSpaces, createSpace, type SpaceApi } from "../../../../../lib/spaces-api";
import { getRootPages, createPage, type PageApi } from "../../../../../lib/pages-api";
import {
  hasRoutineCapability,
  hasProductVaultCapability,
  hasCheckinsCapability,
  hasProgressPhotosCapability,
  hasInsightsCapability,
} from "../../../../../lib/workspace-type-registry";
import type { WorkspaceApi } from "../../../../../lib/workspaces-api";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const t = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const [workspace, setWorkspace] = useState<WorkspaceApi | null>(null);
  const [spaces, setSpaces] = useState<SpaceApi[]>([]);
  const [rootPages, setRootPages] = useState<PageApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingPage, setCreatingPage] = useState(false);
  const [newSpaceTitle, setNewSpaceTitle] = useState("");

  useEffect(() => {
    if (!token || !workspaceId) return;
    Promise.all([
      getWorkspace(token, workspaceId),
      getSpaces(token, workspaceId),
      getRootPages(token, workspaceId),
    ])
      .then(([w, s, p]) => {
        setWorkspace(w);
        setSpaces(s);
        setRootPages(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  async function handleCreatePage() {
    if (!token || !workspaceId) return;
    setCreatingPage(true);
    setError("");
    try {
      const created = await createPage(token, workspaceId, { title: t("newPage") });
      setRootPages((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorCreatePage"));
    } finally {
      setCreatingPage(false);
    }
  }

  async function handleCreateSpace() {
    if (!token || !workspaceId || !newSpaceTitle.trim()) return;
    setError("");
    try {
      const created = await createSpace(token, workspaceId, { title: newSpaceTitle.trim() });
      setSpaces((prev) => [...prev, created]);
      setNewSpaceTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorCreateSpace"));
    }
  }

  if (loading || !workspace) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">{loading ? tCommon("loading") : t("workspaceNotFound")}</p>
      </div>
    );
  }

  const hasRoutine = hasRoutineCapability(workspace.workspaceType);
  const hasProductVault = hasProductVaultCapability(workspace.workspaceType);
  const hasCheckins = hasCheckinsCapability(workspace.workspaceType);
  const hasProgressPhotos = hasProgressPhotosCapability(workspace.workspaceType);
  const hasInsights = hasInsightsCapability(workspace.workspaceType);
  const hasSectionNav =
    hasRoutine || hasProductVault || hasCheckins || hasProgressPhotos || hasInsights;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
          {workspace.name}
        </h1>
        {!hasSectionNav && hasRoutine && (
          <Link
            href={`/dashboard/workspaces/${workspaceId}/routine`}
            className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)] hover:text-[var(--app-gold)]"
          >
            {t("weeklyRoutine")}
          </Link>
        )}
      </div>

      {hasSectionNav && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            Hoy
          </h2>
          <div className="flex flex-wrap gap-3">
            {hasRoutine && (
              <Link
                href={`/dashboard/workspaces/${workspaceId}/routine`}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-[var(--app-fg)] hover:border-[var(--app-gold)]/30 hover:bg-[var(--app-bg)] min-w-[140px]"
              >
                <span className="block text-sm font-medium">Rutina de hoy</span>
                <span className="block text-xs text-[var(--app-fg)]/60 mt-0.5">
                  AM y PM
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          {t("spaces")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {spaces.map((s) => (
            <span
              key={s.id}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm text-[var(--app-fg)]"
            >
              {s.title}
            </span>
          ))}
          <div className="flex gap-1">
            <input
              type="text"
              value={newSpaceTitle}
              onChange={(e) => setNewSpaceTitle(e.target.value)}
              placeholder={t("newSpacePlaceholder")}
              className="w-36 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50"
            />
            <button
              type="button"
              onClick={handleCreateSpace}
              className="rounded-lg bg-[var(--app-navy)] px-2.5 py-1.5 text-sm text-white hover:opacity-90"
            >
              {t("add")}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            {t("pages")}
          </h2>
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creatingPage}
            className="rounded-lg bg-[var(--app-gold)] px-3 py-1.5 text-sm font-medium text-[var(--app-black)] hover:opacity-90 disabled:opacity-50"
          >
            {creatingPage ? t("creatingPage") : t("newPage")}
          </button>
        </div>
        {rootPages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--app-border)] py-8 text-center text-sm text-[var(--app-fg)]/50">
            {t("noPagesYet")}
          </p>
        ) : (
          <ul className="space-y-1">
            {rootPages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/workspaces/${workspaceId}/pages/${p.id}`}
                  className="block rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-[var(--app-fg)] hover:border-[var(--app-gold)]/30 hover:bg-[var(--app-bg)]"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
