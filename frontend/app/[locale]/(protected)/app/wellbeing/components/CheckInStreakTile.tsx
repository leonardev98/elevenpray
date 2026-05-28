"use client";

import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";

type CheckInStreakTileProps = {
  streak: number;
  bestStreak: number;
};

export function CheckInStreakTile({ streak, bestStreak }: CheckInStreakTileProps) {
  const t = useTranslations("studentWellbeing");

  return (
    <section className="rounded-2xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)]/12 text-[var(--app-primary)]">
          <Flame className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-[var(--app-fg)]">
            {t("emotionalCheckInStreak", { count: streak })}
          </p>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{t("emotionalCheckInStreakHint")}</p>
          {bestStreak > 0 ? (
            <p className="mt-2 text-xs font-medium text-[var(--app-fg-secondary)]">
              {t("emotionalCheckInBestStreak", { count: bestStreak })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
