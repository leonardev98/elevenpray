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
import { WeekScheduleCard } from "./components/week-schedule-card";
import { SkincareDashboardCards } from "./components/skincare-dashboard-cards";
import { toast } from "../../../../../lib/toast";

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
      toast.success("Página creada", t("newPage"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errorCreatePage");
      setError(msg);
      toast.error("Error al crear página", msg);
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
      toast.success("Espacio creado", newSpaceTitle.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errorCreateSpace");
      setError(msg);
      toast.error("Error al crear espacio", msg);
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
  const isSkincare = workspace.workspaceType === "skincare";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--app-fg)]">
          {workspace.name}
        </h1>
        {!hasSectionNav && hasRoutine && (
          <Link
            href={`/dashboard/workspaces/${workspaceId}/routine`}
            className="rounded-xl border border-[var(--app-navy)]/50 bg-[var(--app-navy)]/10 px-4 py-2.5 text-sm font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/20"
          >
            {t("weeklyRoutine")}
          </Link>
        )}
      </div>

      {isSkincare && (
        <SkincareDashboardCards workspaceId={workspaceId} />
      )}

      {hasRoutine && (
        <WeekScheduleCard workspaceId={workspaceId} />
      )}

      {hasProductVault && (
        <Link
          href={`/dashboard/workspaces/${workspaceId}/products`}
          className="flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition hover:border-[var(--app-navy)]/40 hover:shadow-md lg:hidden"
        >
          <span className="font-medium text-[var(--app-fg)]">Ver productos</span>
          <span className="text-[var(--app-navy)]">→</span>
        </Link>
      )}

      {hasSectionNav && hasRoutine && (
        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            Hoy
          </h2>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/routine`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-fg)] transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5"
          >
            <span className="font-medium">Rutina de hoy</span>
            <span className="text-xs text-[var(--app-fg)]/60">AM y PM</span>
          </Link>
        </section>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          {t("spaces")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {spaces.map((s) => (
            <span
              key={s.id}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm font-medium text-[var(--app-fg)]"
            >
              {s.title}
            </span>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSpaceTitle}
              onChange={(e) => setNewSpaceTitle(e.target.value)}
              placeholder={t("newSpacePlaceholder")}
              className="w-40 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
            />
            <button
              type="button"
              onClick={handleCreateSpace}
              className="rounded-xl bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90"
            >
              {t("add")}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            {t("pages")}
          </h2>
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creatingPage}
            className="rounded-xl bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
          >
            {creatingPage ? t("creatingPage") : t("newPage")}
          </button>
        </div>
        {rootPages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--app-border)] py-10 text-center text-sm text-[var(--app-fg)]/50">
            {t("noPagesYet")}
          </p>
        ) : (
          <ul className="space-y-2">
            {rootPages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/workspaces/${workspaceId}/pages/${p.id}`}
                  className="block rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 font-medium text-[var(--app-fg)] transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5"
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
