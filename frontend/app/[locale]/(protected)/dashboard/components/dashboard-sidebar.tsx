"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useWorkspaces } from "./workspaces-provider";
import { NewWorkspaceModal } from "./new-workspace-modal";
import type { WorkspaceTypeId } from "./topic-types";
import type { WorkspaceApi } from "../../../../lib/workspaces-api";
import {
  hasRoutineCapability,
  hasProductVaultCapability,
  hasCheckinsCapability,
  hasProgressPhotosCapability,
  hasInsightsCapability,
  getWorkspaceType,
  getWorkspaceCategoryLabel,
  getWorkspaceDomain,
  WORKSPACE_DOMAIN_IDS,
  type WorkspaceDomainId,
} from "../../../../lib/workspace-type-registry";

const DELETE_COUNTDOWN_SECONDS = 3;

type NavItem = { href: string; key: "dashboard" | "routines" };

interface DashboardSidebarProps {
  navHrefs: NavItem[];
  pathname: string | null;
  t: (key: string) => string;
  isPlatformAdmin: boolean;
  workspacesDrawerOpen: boolean;
  onCloseWorkspacesDrawer: () => void;
  onOpenWorkspacesDrawer: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  navHrefs,
  pathname,
  t,
  isPlatformAdmin,
  onCloseWorkspacesDrawer,
  isMobileDrawer = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const tWorkspace = useTranslations("workspace");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("workspaceTypes");
  const tDomains = useTranslations("workspaceDomains");
  const { workspaces, isLoading, addWorkspace, removeWorkspace, error } = useWorkspaces();

  const workspacesByDomain = useMemo(() => {
    const map = new Map<WorkspaceDomainId, WorkspaceApi[]>();
    for (const id of WORKSPACE_DOMAIN_IDS) map.set(id, []);
    for (const w of workspaces) {
      const domain = getWorkspaceDomain(w.workspaceType);
      map.get(domain)?.push(w);
    }
    return map;
  }, [workspaces]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmWorkspace, setDeleteConfirmWorkspace] = useState<WorkspaceApi | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);

  useEffect(() => {
    if (!deleteConfirmWorkspace) {
      setDeleteCountdown(0);
      return;
    }
    setDeleteCountdown(DELETE_COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteConfirmWorkspace]);

  async function handleCreateWorkspace(
    name: string,
    workspaceType: WorkspaceTypeId,
    workspaceSubtypeId?: string | null
  ) {
    await addWorkspace(name, workspaceType, workspaceSubtypeId);
  }

  const baseClass =
    "flex h-full w-64 flex-shrink-0 flex-col bg-[var(--app-surface)] border-r border-[var(--app-border)]";
  const wrapperClass = isMobileDrawer ? "h-full w-[280px] " + baseClass : baseClass;

  return (
    <aside
      className={wrapperClass}
      aria-label={tWorkspace("workspaces")}
      style={isMobileDrawer ? { minHeight: "100vh" } : undefined}
    >
      {isMobileDrawer && (
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <span className="font-semibold text-[var(--app-fg)]">{tCommon("menu")}</span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={tCommon("closeMenu")}
            className="rounded-xl p-2 text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] transition"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Logo */}
        <div className="border-b border-[var(--app-border)] px-4 py-5">
          <Link
            href="/dashboard"
            onClick={isMobileDrawer ? onCloseMobile : undefined}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-navy)] text-[var(--app-gold)] font-bold text-lg shadow-sm">
              E
            </span>
            <span className="text-lg font-semibold tracking-tight text-[var(--app-fg)]">
              ElevenPray
            </span>
          </Link>
        </div>

        {/* Nav principal */}
        <nav className="border-b border-[var(--app-border)] px-3 py-3">
          <ul className="space-y-0.5">
            {navHrefs.map(({ href, key }) => {
              const isActive =
                href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={isMobileDrawer ? onCloseMobile : undefined}
                    className={`flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--app-navy)] text-[var(--app-white)] shadow-sm"
                        : "text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
                    }`}
                  >
                    {t(key)}
                  </Link>
                </li>
              );
            })}
            {isPlatformAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={isMobileDrawer ? onCloseMobile : undefined}
                  className="flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--app-gold)] hover:bg-[var(--app-gold)]/10 transition"
                >
                  Panel Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Mis espacios */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/50">
            {tWorkspace("mySpaces")}
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mb-4 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] shadow-sm transition hover:opacity-90"
          >
            + {tWorkspace("newWorkspace")}
          </button>

          <NewWorkspaceModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleCreateWorkspace}
            error={error}
          />

          {/* Modal confirmar eliminar workspace */}
          {deleteConfirmWorkspace && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-black)]/50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-workspace-title"
            >
              <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl">
                <h2
                  id="confirm-delete-workspace-title"
                  className="text-lg font-semibold text-[var(--app-fg)]"
                >
                  {tWorkspace("confirmDeleteWorkspaceTitle")}
                </h2>
                <p className="mt-3 text-sm text-[var(--app-fg)]/80">
                  {tWorkspace("confirmDeleteWorkspaceMessage")}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--app-fg)]">
                  «{getWorkspaceType(deleteConfirmWorkspace.workspaceType) ? tTypes(deleteConfirmWorkspace.workspaceType) : deleteConfirmWorkspace.workspaceType}» — {deleteConfirmWorkspace.name}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmWorkspace(null)}
                    className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-border)]/50"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={deleteCountdown > 0}
                    onClick={async () => {
                      if (deleteCountdown > 0) return;
                      const w = deleteConfirmWorkspace;
                      setDeleteConfirmWorkspace(null);
                      await removeWorkspace(w.id);
                    }}
                    className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-navy)] px-4 py-2.5 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteCountdown > 0
                      ? tWorkspace("deleteButtonCountdown", { seconds: deleteCountdown })
                      : tWorkspace("deleteButtonReady")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <p className="px-2 py-4 text-xs text-[var(--app-fg)]/50">{tCommon("loading")}</p>
          )}
          {WORKSPACE_DOMAIN_IDS.map((domainId) => {
            const list = workspacesByDomain.get(domainId) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={domainId} className="mb-4">
                <h3 className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/50">
                  {tDomains(domainId)}
                </h3>
                <ul className="space-y-1">
                  {list.map((w) => {
                    const hasRoutine = hasRoutineCapability(w.workspaceType);
                    const hasSectionNav =
                      hasProductVaultCapability(w.workspaceType) ||
                      hasCheckinsCapability(w.workspaceType) ||
                      hasProgressPhotosCapability(w.workspaceType) ||
                      hasInsightsCapability(w.workspaceType);
                    const href =
                      hasSectionNav
                        ? `/dashboard/workspaces/${w.id}`
                        : hasRoutine
                          ? `/dashboard/workspaces/${w.id}/routine`
                          : `/dashboard/workspaces/${w.id}`;
                    const typeDef = getWorkspaceType(w.workspaceType);
                    const typeLabel = typeDef ? tTypes(w.workspaceType) : w.workspaceType;
                    const categoryLabel = typeDef ? getWorkspaceCategoryLabel(typeDef.category) : "";
                    const isActive = pathname?.startsWith(`/dashboard/workspaces/${w.id}`);
                    return (
                      <li key={w.id}>
                        <div
                          className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                            isActive ? "bg-[var(--app-gold)]/10" : "hover:bg-[var(--app-bg)]"
                          }`}
                        >
                          <Link
                            href={href}
                            onClick={isMobileDrawer ? onCloseMobile : undefined}
                            className="min-w-0 flex-1 py-1.5"
                          >
                            <span className={`block truncate text-sm font-medium ${isActive ? "text-[var(--app-gold)]" : "text-[var(--app-fg)]"}`}>
                              {typeLabel}
                            </span>
                            {categoryLabel && (
                              <span className="block truncate text-xs text-[var(--app-fg)]/50">
                                {categoryLabel}
                              </span>
                            )}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmWorkspace(w)}
                            aria-label={tWorkspace("deleteWorkspace")}
                            className="flex-shrink-0 rounded-lg p-1.5 text-[var(--app-fg)]/40 opacity-0 transition group-hover:opacity-100 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--app-border)] p-4">
          <div className="rounded-xl bg-[var(--app-navy)]/5 border border-[var(--app-border)]/50 p-3 text-center">
            <p className="text-xs font-medium text-[var(--app-fg)]/70">Tu espacio, tu ritmo.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
