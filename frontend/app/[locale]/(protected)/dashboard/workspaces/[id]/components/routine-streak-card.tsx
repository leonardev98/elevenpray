"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";

const WEEKDAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

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

interface RoutineStreakCardProps {
  workspaceId: string;
}

export function RoutineStreakCard({ workspaceId }: RoutineStreakCardProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tDays = useTranslations("days");
  const [checkinDates, setCheckinDates] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date();
    from.setDate(from.getDate() - 14);
    const fromStr = from.toISOString().slice(0, 10);
    getWorkspaceCheckins(token, workspaceId, { from: fromStr, to: today })
      .then((list) => setCheckinDates(list.map((c) => c.checkinDate)))
      .catch(() => {});
  }, [token, workspaceId]);

  const streak = computeStreak(checkinDates);
  const weekdayCheckins = getWeekdayCheckins(checkinDates);

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
      aria-labelledby="routine-streak-heading"
    >
      <h2
        id="routine-streak-heading"
        className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" aria-hidden />
        {t("currentStreak")}
      </h2>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-normal text-[var(--app-navy)] dark:text-sky-400">
          {streak}
        </span>
        <span className="text-sm text-[var(--app-fg)]/80 dark:text-slate-300">
          {t("daysInARow")}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1" aria-label={t("thisWeek")}>
        {WEEKDAY_KEYS.map((key, i) => (
          <div
            key={key}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-[var(--app-bg)]/80 py-1.5 dark:bg-zinc-800/80"
          >
            <span className="text-[10px] font-medium uppercase text-[var(--app-fg)]/60 dark:text-slate-500">
              {tDays(key)}
            </span>
            <span className="text-xs font-medium text-[var(--app-navy)] dark:text-sky-400" aria-hidden>
              {weekdayCheckins.has(i) ? "✔" : "○"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
