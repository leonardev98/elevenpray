"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";

function formatDate(s: string) {
  return new Date(s + "Z").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WorkspaceProgressPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [checkins, setCheckins] = useState<{ checkinDate: string; data?: { skinFeeling?: string; freeNotes?: string } | null }[]>([]);
  const [photosCount, setPhotosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError("");
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    Promise.all([
      getWorkspaceCheckins(token, workspaceId, { from, to }),
      getWorkspacePhotos(token, workspaceId),
    ])
      .then(([cList, pList]) => {
        setCheckins(
          cList.map((c) => ({
            checkinDate: c.checkinDate,
            data: c.data as { skinFeeling?: string; freeNotes?: string } | null | undefined,
          }))
        );
        setPhotosCount(pList.length);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  if (loading) {
    return (
      <div className="py-8 text-center text-[var(--app-fg)]/60">
        Cargando progreso…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-[var(--app-fg)]">Progreso</h1>
      <p className="text-sm text-[var(--app-fg)]/70">
        Resumen de tu seguimiento: journal y fotos de progreso.
      </p>

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Resumen
        </h2>
        <ul className="space-y-1 text-sm text-[var(--app-fg)]">
          <li>
            <strong>{checkins.length}</strong> entradas en el journal (últimos 90 días)
          </li>
          <li>
            <strong>{photosCount}</strong> fotos de progreso en total
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Journal reciente
        </h2>
        {checkins.length === 0 ? (
          <p className="text-sm text-[var(--app-fg)]/60">Aún no hay entradas.</p>
        ) : (
          <ul className="space-y-3">
            {checkins.slice(0, 15).map((c) => (
              <li
                key={c.checkinDate}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--app-border)]/50 pb-2 last:border-0"
              >
                <span className="text-sm font-medium text-[var(--app-fg)]">
                  {formatDate(c.checkinDate)}
                </span>
                <span className="text-sm text-[var(--app-fg)]/80">
                  {c.data?.skinFeeling ?? (c.data?.freeNotes ? "Notas" : "—")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`${base}/journal`}
          className="mt-4 inline-block text-sm font-medium text-[var(--app-navy)] hover:underline"
        >
          Ir al Journal →
        </Link>
      </section>

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Fotos de progreso
        </h2>
        <p className="text-sm text-[var(--app-fg)]/80">
          Tienes {photosCount} fotos. Añade más para comparar cambios con el tiempo.
        </p>
        <Link
          href={`${base}/photos`}
          className="mt-4 inline-block text-sm font-medium text-[var(--app-navy)] hover:underline"
        >
          Ver fotos →
        </Link>
      </section>
    </div>
  );
}
