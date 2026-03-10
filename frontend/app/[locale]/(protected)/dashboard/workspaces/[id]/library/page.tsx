"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getRootPages, type PageApi } from "../../../../../../lib/pages-api";

export default function WorkspaceLibraryPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [pages, setPages] = useState<PageApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getRootPages(token, workspaceId)
      .then(setPages)
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-[var(--app-fg)]">
        Library
      </h2>
      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : pages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-sm text-[var(--app-fg)]/60">
          No hay páginas. Crea contenido desde el overview.
        </p>
      ) : (
        <ul className="space-y-1">
          {pages.map((p) => (
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
      <p className="mt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm text-[var(--app-gold)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>
    </div>
  );
}
