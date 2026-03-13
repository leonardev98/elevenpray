"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";
import { TodayRoutineHeroCard } from "./today-routine-hero-card";
import { CompletionCelebration } from "./completion-celebration";
import { ChevronRight } from "lucide-react";

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

const WEEKDAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

/** Compute streak: consecutive days with at least one check-in, counting backwards from today. */
function computeStreak(checkinDates: string[]): number {
  const set = new Set(checkinDates.map((d) => d.slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    if (!set.has(dateStr)) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Get which weekdays (0=Mon..6=Sun) have a check-in in the last 7 days. */
function getWeekdayCheckins(checkinDates: string[]): Set<number> {
  const set = new Set(checkinDates.map((d) => d.slice(0, 10)));
  const out = new Set<number>();
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    if (set.has(dateStr)) {
      const day = (d.getDay() + 6) % 7;
      out.add(day);
    }
    d.setDate(d.getDate() - 1);
  }
  return out;
}

export function SkincareDashboardCards({ workspaceId }: SkincareDashboardCardsProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tDays = useTranslations("days");
  const [recentCheckin, setRecentCheckin] = useState<{ date: string; feeling?: string } | null>(null);
  const [photosCount, setPhotosCount] = useState<number>(0);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!token || !workspaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date();
    from.setDate(from.getDate() - 14);
    const fromStr = from.toISOString().slice(0, 10);
    getWorkspaceCheckins(token, workspaceId, { from: fromStr, to: today })
      .then((list) => {
        const dates = list.map((c) => c.checkinDate);
        setCheckinDates(dates);
        if (list.length) {
          const c = list[list.length - 1];
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

  const handleRoutineComplete = useCallback(() => {
    setShowCelebration(true);
  }, []);

  const streak = computeStreak(checkinDates);
  const weekdayCheckins = getWeekdayCheckins(checkinDates);
  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <div className="space-y-10">
      <CompletionCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* Hero: Rutina de hoy */}
      <TodayRoutineHeroCard workspaceId={workspaceId} onRoutineComplete={handleRoutineComplete} />

      {/* Grid de 3: Racha, Progreso de piel, Insights personales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Racha con visualización semanal */}
        <section
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md"
          aria-labelledby="skincare-streak-heading"
        >
          <h2
            id="skincare-streak-heading"
            className="mb-3 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
          >
            {t("currentStreak")}
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-normal text-[var(--app-navy)]">
              {streak}
            </span>
            <span className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
              {t("daysInARow")}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-[var(--app-fg)]/70 dark:text-slate-400">
            {t("completeAmPmToAddDays")}
          </p>
          <div className="mt-4 flex items-center gap-1" aria-label="This week">
            {WEEKDAY_KEYS.map((key, i) => (
              <div
                key={key}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-[var(--app-bg)]/80 py-2 dark:bg-zinc-800/80"
              >
                <span className="text-[10px] font-medium uppercase text-[var(--app-fg)]/60 dark:text-slate-500">
                  {tDays(key)}
                </span>
                <span
                  className="text-sm font-medium text-[var(--app-navy)]"
                  aria-hidden
                >
                  {weekdayCheckins.has(i) ? "✓" : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Progreso de piel */}
        <section
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md"
          aria-labelledby="skincare-progress-heading"
        >
          <h2
            id="skincare-progress-heading"
            className="mb-3 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
          >
            {t("skinProgress")}
          </h2>
          {recentCheckin ? (
            <p className="text-sm font-normal text-[var(--app-fg)] dark:text-slate-300">
              {t("lastJournal")}:{" "}
              <span className="font-medium">{recentCheckin.feeling || t("noted")}</span>
            </p>
          ) : (
            <p className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-400">
              {t("noJournalEntriesYet")}
            </p>
          )}
          <p className="mt-1 text-xs font-medium text-[var(--app-fg)]/70 dark:text-slate-400">
            {t("progressPhotosCount", { count: photosCount })}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`${base}/journal`}
              className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5 dark:text-zinc-200"
            >
              {t("journal")}
            </Link>
            <Link
              href={`${base}/photos`}
              className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5 dark:text-zinc-200"
            >
              {t("photos")}
            </Link>
          </div>
        </section>

        {/* Insights personales */}
        <section
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md"
          aria-labelledby="skincare-insights-heading"
        >
          <h2
            id="skincare-insights-heading"
            className="mb-3 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
          >
            {t("personalInsights")}
          </h2>
          <p className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
            {t("productsAndArticlesByProfile")}
          </p>
          <Link
            href={`${base}/library`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--app-navy)] transition hover:underline dark:text-sky-400"
          >
            {t("viewCatalog")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* Accesos rápidos */}
      <section className="mt-12" aria-labelledby="skincare-hub-heading">
        <h2
          id="skincare-hub-heading"
          className="mb-4 text-lg font-semibold text-[var(--app-fg)] dark:text-zinc-200"
        >
          {t("quickAccess")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_CARDS.map(({ href, labelKey, descKey }) => (
            <Link
              key={href}
              href={`${base}/${href}`}
              className="flex cursor-pointer items-start justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/40 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-[var(--app-navy)]/50"
            >
              <div>
                <h3 className="text-base font-medium text-[var(--app-fg)] dark:text-zinc-200">
                  {t(labelKey)}
                </h3>
                <p className="mt-1 text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
                  {t(descKey)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-[var(--app-navy)] dark:text-sky-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
