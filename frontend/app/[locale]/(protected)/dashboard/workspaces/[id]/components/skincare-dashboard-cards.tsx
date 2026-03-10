"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";

interface SkincareDashboardCardsProps {
  workspaceId: string;
}

const HUB_CARDS: { href: string; labelKey: string; descKey: string }[] = [
  { href: "routine", labelKey: "routine", descKey: "hubRoutineDesc" },
  { href: "journal", labelKey: "skin", descKey: "hubSkinDesc" },
  { href: "products", labelKey: "products", descKey: "hubProductsDesc" },
  { href: "knowledge", labelKey: "learn", descKey: "hubLearnDesc" },
  { href: "experts", labelKey: "experts", descKey: "hubExpertsDesc" },
  { href: "insights", labelKey: "insights", descKey: "hubInsightsDesc" },
];

export function SkincareDashboardCards({ workspaceId }: SkincareDashboardCardsProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const [recentCheckin, setRecentCheckin] = useState<{ date: string; feeling?: string } | null>(null);
  const [photosCount, setPhotosCount] = useState<number>(0);

  useEffect(() => {
    if (!token || !workspaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    getWorkspaceCheckins(token, workspaceId, { to: today })
      .then((list) => {
        if (list.length) {
          const c = list[0];
          setRecentCheckin({
            date: c.checkinDate,
            feeling: c.data?.skinFeeling as string | undefined,
          });
        }
      })
      .catch(() => {});
    getWorkspacePhotos(token, workspaceId)
      .then((list) => setPhotosCount(list.length))
      .catch(() => {});
  }, [token, workspaceId]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Rutina de hoy + racha */}
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:border-[var(--app-gold)]/30 hover:shadow-md"
        aria-labelledby="skincare-today-heading"
      >
        <h2 id="skincare-today-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Hoy
        </h2>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--app-gold)]/40 bg-[var(--app-gold)]/5">
            <span className="text-lg font-bold text-[var(--app-gold)]">—</span>
          </div>
          <div>
            <p className="font-medium text-[var(--app-fg)]">Rutina mañana y noche</p>
            <p className="text-xs text-[var(--app-fg)]/60">Marca completado en Rutina</p>
          </div>
        </div>
        <Link
          href={`${base}/routine`}
          className="block rounded-xl bg-[var(--app-navy)] py-2.5 text-center text-sm font-medium text-[var(--app-white)] transition hover:opacity-90"
        >
          Ir a mi rutina
        </Link>
      </section>

      {/* Racha */}
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm"
        aria-labelledby="skincare-streak-heading"
      >
        <h2 id="skincare-streak-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Racha
        </h2>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-[var(--app-gold)]">—</span>
          <span className="text-sm text-[var(--app-fg)]/60">días seguidos</span>
        </div>
        <p className="mt-2 text-xs text-[var(--app-fg)]/60">
          Completa rutina AM o PM para sumar días.
        </p>
      </section>

      {/* Progreso / Journal */}
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:border-[var(--app-gold)]/30"
        aria-labelledby="skincare-progress-heading"
      >
        <h2 id="skincare-progress-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Progreso
        </h2>
        {recentCheckin ? (
          <p className="text-sm text-[var(--app-fg)]">
            Último journal: <span className="font-medium">{recentCheckin.feeling || "Anotado"}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--app-fg)]/60">Aún no hay entradas en el journal.</p>
        )}
        <p className="mt-1 text-xs text-[var(--app-fg)]/50">{photosCount} fotos de progreso</p>
        <div className="mt-3 flex gap-2">
          <Link
            href={`${base}/journal`}
            className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            Journal
          </Link>
          <Link
            href={`${base}/photos`}
            className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            Fotos
          </Link>
        </div>
      </section>

      {/* Recomendaciones */}
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:border-[var(--app-gold)]/30"
        aria-labelledby="skincare-recs-heading"
      >
        <h2 id="skincare-recs-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Para ti
        </h2>
        <p className="text-sm text-[var(--app-fg)]/80">
          Productos y artículos según tu perfil de piel.
        </p>
        <Link
          href={`${base}/library`}
          className="mt-3 inline-block text-sm font-medium text-[var(--app-gold)] hover:underline"
        >
          Ver catálogo →
        </Link>
      </section>
      </div>

      {/* Hub: acceso rápido a secciones principales */}
      <section aria-labelledby="skincare-hub-heading">
        <h2 id="skincare-hub-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
          Accesos rápidos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_CARDS.map(({ href, labelKey, descKey }) => (
            <Link
              key={href}
              href={`${base}/${href}`}
              className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition hover:border-[var(--app-gold)]/30 hover:shadow-md"
            >
              <h3 className="font-medium text-[var(--app-fg)]">{t(labelKey)}</h3>
              <p className="mt-1 text-sm text-[var(--app-fg)]/70">
                {t(descKey)}
              </p>
              <span className="mt-2 inline-block text-sm font-medium text-[var(--app-gold)]">
                Ir →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
