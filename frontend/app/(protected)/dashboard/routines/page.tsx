"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../providers/auth-provider";
import { getWorkspaces } from "../../../lib/workspaces-api";
import type { WorkspaceApi } from "../../../lib/workspaces-api";
import { hasRoutineCapability } from "../../../lib/workspace-type-registry";

export default function RoutinesPage() {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getWorkspaces(token)
      .then(setWorkspaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const workspacesWithRoutine = workspaces.filter((w) =>
    hasRoutineCapability(w.workspaceType)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">Cargando…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
        Mis rutinas
      </h1>
      <p className="mt-1 text-sm text-[var(--app-fg)]/60">
        Abre la plantilla semanal de cada workspace para editarla.
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {workspacesWithRoutine.length === 0 && (
          <li className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-[var(--app-fg)]/50">
            No tienes workspaces con rutina. Crea un workspace (Skincare, Fitness o General) desde el menú lateral.
          </li>
        )}
        {workspacesWithRoutine.map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-gold)]/30"
          >
            <span className="font-medium text-[var(--app-fg)]">{w.name}</span>
            <Link
              href={`/dashboard/workspaces/${w.id}/routine`}
              className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)] hover:text-[var(--app-gold)]"
            >
              Abrir rutina
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
