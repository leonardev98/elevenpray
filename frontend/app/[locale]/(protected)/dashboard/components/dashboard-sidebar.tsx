"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { MagneticWrap } from "@/lib/animations";
import { Plus } from "lucide-react";
import { useWorkspaces } from "./workspaces-provider";
import { NewWorkspaceModal } from "./new-workspace-modal";
import type { WorkspaceTypeId } from "./topic-types";
import type { WorkspaceApi } from "../../../../lib/workspaces-api";
import { cn } from "@/lib/utils";
import {
  hasRoutineCapability,
  hasProductVaultCapability,
  hasCheckinsCapability,
  hasProgressPhotosCapability,
  hasInsightsCapability,
  getWorkspaceType,
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
  const tCategories = useTranslations("workspaceCategories");
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
          <span className="text-sm font-medium text-[var(--app-fg)]">{tCommon("menu")}</span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={tCommon("closeMenu")}
            className="rounded-lg p-2 text-[var(--app-fg)]/60 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Logo — zona marca */}
        <div className="border-b border-[var(--dev-border-subtle)] px-4 py-5">
          <Link
            href="/dashboard"
            onClick={isMobileDrawer ? onCloseMobile : undefined}
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-navy)] text-[var(--app-white)] font-bold text-lg shadow-sm">
              E
            </span>
            <span className="text-lg font-semibold tracking-normal text-[var(--app-fg)]">
              Mitsyy
            </span>
          </Link>
        </div>

        {/* Nav principal — más aire */}
        <nav className="border-b border-[var(--dev-border-subtle)] px-3 py-4" aria-label="Main">
          <ul className="space-y-1">
            {navHrefs.map(({ href, key }) => {
              const isActive =
                href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
              return (
                <motion.li key={href} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
                  <Link
                    href={href}
                    onClick={isMobileDrawer ? onCloseMobile : undefined}
                    className={cn(
                      "flex min-h-[42px] items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-[var(--app-navy)] text-[var(--app-white)] shadow-sm"
                        : "text-[var(--app-fg)]/80 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    )}
                  >
                    {t(key)}
                  </Link>
                </motion.li>
              );
            })}
            {isPlatformAdmin && (
              <motion.li whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
                <Link
                  href="/admin"
                  onClick={isMobileDrawer ? onCloseMobile : undefined}
                  className="flex min-h-[42px] items-center rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--app-navy)] transition-colors hover:bg-[var(--app-navy)]/10"
                >
                  {t("adminPanel")}
                </Link>
              </motion.li>
            )}
          </ul>
        </nav>

        {/* Mis espacios — label refinado, más jerarquía */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/55 dark:text-slate-400">
            {tWorkspace("mySpaces")}
          </p>
          <MagneticWrap className="mb-5 block" strength={0.1}>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
              {tWorkspace("newWorkspace")}
            </button>
          </MagneticWrap>

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
                  «{deleteConfirmWorkspace.name || (getWorkspaceType(deleteConfirmWorkspace.workspaceType) ? tTypes(deleteConfirmWorkspace.workspaceType) : deleteConfirmWorkspace.workspaceType)}»
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
              <div key={domainId} className="mb-6">
                <h3 className="mb-2 px-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/55">
                  {tDomains(domainId)}
                </h3>
                <ul className="space-y-0.5">
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
                    const categoryLabel = typeDef ? tCategories(typeDef.category) : "";
                    const displayName = w.name?.trim() || (typeDef ? tTypes(w.workspaceType) : w.workspaceType);
                    const isDeveloperRoute = pathname?.startsWith?.("/workspace/developer") ?? false;
                    const subtypeCode = (w.workspaceSubtype?.code ?? (w as { workspace_subtype?: { code?: string } }).workspace_subtype?.code)?.toLowerCase?.();
                    const isDeveloperWorkspace = subtypeCode === "programador" || subtypeCode === "programmer";
                    const isActive =
                      pathname?.startsWith(`/dashboard/workspaces/${w.id}`) ||
                      (isDeveloperRoute && isDeveloperWorkspace);
                    return (
                      <li key={w.id}>
                        <div
                          className={cn(
                            "group relative flex items-center gap-2 rounded-xl py-2 pl-3 pr-2 transition-all duration-150",
                            isActive
                              ? "bg-[var(--app-navy)]/10"
                              : "hover:bg-[var(--app-bg)]"
                          )}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--app-navy)]"
                              aria-hidden
                            />
                          )}
                          <Link
                            href={href}
                            onClick={isMobileDrawer ? onCloseMobile : undefined}
                            className="min-w-0 flex-1 py-1.5"
                          >
                            <span
                              className={cn(
                                "block truncate text-sm",
                                isActive ? "font-semibold text-[var(--app-navy)]" : "font-medium text-[var(--app-fg)]"
                              )}
                            >
                              {displayName}
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
                            className="flex-shrink-0 rounded-lg p-1.5 text-[var(--app-fg)]/40 opacity-0 transition-all duration-150 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)] group-hover:opacity-100"
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
        <div className="border-t border-[var(--dev-border-subtle)] p-4 dark:border-zinc-700">
          <div className="rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-navy)]/5 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
            <p className="text-xs font-medium text-[var(--app-fg)]/60 dark:text-slate-400">{tWorkspace("tagline")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
