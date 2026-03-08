"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspaces } from "./workspaces-provider";
import { NewWorkspaceModal } from "./new-workspace-modal";
import type { WorkspaceTypeId } from "./topic-types";
import { hasRoutineCapability } from "../../../lib/workspace-type-registry";

interface AsideTopicsProps {
  /** En móvil: drawer abierto y callback para cerrar */
  drawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

function WorkspacesContent({ error }: { error: string | null }) {
  const { workspaces, isLoading, addWorkspace, removeWorkspace } = useWorkspaces();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreateWorkspace(
    name: string,
    workspaceType: WorkspaceTypeId,
    workspaceSubtypeId?: string | null
  ) {
    await addWorkspace(name, workspaceType, workspaceSubtypeId);
  }

  return (
    <>
      <div className="border-b border-[var(--app-border)] px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/80">
          Workspaces
        </h2>
        <p className="mt-1 text-xs text-[var(--app-fg)]/50">
          Organiza tu contenido por dominio.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-3 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)] focus:ring-offset-2 focus:ring-offset-[var(--app-surface)]"
        >
          Nuevo workspace
        </button>
      </div>

      <NewWorkspaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateWorkspace}
        error={error}
      />

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {workspaces.length === 0 && !modalOpen && (
          <p className="px-1 py-6 text-xs text-[var(--app-fg)]/50">
            Aún no hay workspaces.
          </p>
        )}
        {isLoading && (
          <p className="px-1 py-6 text-xs text-[var(--app-fg)]/50">
            Cargando…
          </p>
        )}
        <ul className="space-y-0.5">
          {workspaces.map((w) => {
            const hasRoutine = hasRoutineCapability(w.workspaceType);
            const href = hasRoutine ? `/dashboard/workspaces/${w.id}/routine` : `/dashboard/workspaces/${w.id}`;
            return (
              <li
                key={w.id}
                className="group flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-[var(--app-bg)] focus-within:bg-[var(--app-bg)]"
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--app-gold)]/70"
                  aria-hidden
                />
                <Link
                  href={href}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--app-fg)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)] focus:ring-offset-2 focus:ring-offset-[var(--app-surface)] rounded min-h-[44px] flex items-center"
                >
                  {w.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeWorkspace(w.id)}
                  aria-label="Eliminar workspace"
                  className="flex-shrink-0 rounded p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--app-fg)]/50 hover:text-red-500 focus:opacity-100 focus:outline-none group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-[var(--app-border)] pt-4">
          <p className="px-2.5 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/60">
            Más
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="#"
                className="block rounded-lg px-2.5 py-2 text-sm text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:font-medium hover:text-[var(--app-fg)] focus:outline-none focus-visible:bg-[var(--app-bg)] focus-visible:font-medium focus-visible:text-[var(--app-fg)] min-h-[44px] flex items-center"
              >
                Configuración
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block rounded-lg px-2.5 py-2 text-sm text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:font-medium hover:text-[var(--app-fg)] focus:outline-none focus-visible:bg-[var(--app-bg)] focus-visible:font-medium focus-visible:text-[var(--app-fg)] min-h-[44px] flex items-center"
              >
                Rutinas públicas
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export function AsideTopics({ drawerOpen = false, onCloseDrawer }: AsideTopicsProps) {
  const { error } = useWorkspaces();

  return (
    <>
      {/* Sidebar: solo visible en lg+ */}
      <aside
        className="hidden h-full w-60 flex-shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] lg:flex"
        aria-label="Workspaces"
      >
        <WorkspacesContent error={error} />
      </aside>

      {/* Drawer móvil/tablet: overlay + panel */}
      {onCloseDrawer && (
        <>
          <div
            role="presentation"
            aria-hidden="true"
            onClick={onCloseDrawer}
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
              drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          <aside
            aria-label="Menú de workspaces"
            aria-modal="true"
            className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-[280px] flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl transition-transform duration-200 ease-out lg:hidden ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/80">
                Workspaces
              </h2>
              <button
                type="button"
                onClick={onCloseDrawer}
                aria-label="Cerrar menú workspaces"
                className="rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
              >
                ×
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <WorkspacesContent error={error} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
