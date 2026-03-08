"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../providers/auth-provider";
import { getWorkspace } from "../../../../../lib/workspaces-api";
import { getSpaces, createSpace, type SpaceApi } from "../../../../../lib/spaces-api";
import { getRootPages, createPage, type PageApi } from "../../../../../lib/pages-api";
import { hasRoutineCapability } from "../../../../../lib/workspace-type-registry";
import type { WorkspaceApi } from "../../../../../lib/workspaces-api";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
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
      const created = await createPage(token, workspaceId, { title: "Nueva página" });
      setRootPages((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear página");
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
      setError(e instanceof Error ? e.message : "Error al crear space");
    }
  }

  if (loading || !workspace) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">{loading ? "Cargando…" : "Workspace no encontrado"}</p>
      </div>
    );
  }

  const hasRoutine = hasRoutineCapability(workspace.workspaceType);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
          {workspace.name}
        </h1>
        {hasRoutine && (
          <Link
            href={`/dashboard/workspaces/${workspaceId}/routine`}
            className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)] hover:text-[var(--app-gold)]"
          >
            Rutina semanal
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Spaces
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
              placeholder="Nuevo space"
              className="w-36 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50"
            />
            <button
              type="button"
              onClick={handleCreateSpace}
              className="rounded-lg bg-[var(--app-navy)] px-2.5 py-1.5 text-sm text-white hover:opacity-90"
            >
              Añadir
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            Páginas
          </h2>
          <button
            type="button"
            onClick={handleCreatePage}
            disabled={creatingPage}
            className="rounded-lg bg-[var(--app-gold)] px-3 py-1.5 text-sm font-medium text-[var(--app-black)] hover:opacity-90 disabled:opacity-50"
          >
            {creatingPage ? "Creando…" : "Nueva página"}
          </button>
        </div>
        {rootPages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--app-border)] py-8 text-center text-sm text-[var(--app-fg)]/50">
            No hay páginas. Crea una para empezar.
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
