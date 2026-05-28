"use client";

import { useTranslations } from "next-intl";
import {
  Zap,
  Smile,
  Meh,
  Frown,
  Moon,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MoodId } from "../wellbeing-types";
import {
  WEEK_BEST_DAY_INDEX,
  WEEK_EMOTIONAL_TREND,
  WEEK_MOODS,
} from "../wellbeing-mock-data";
import { WellbeingSectionHeading } from "./WellbeingSectionHeading";
import { BentoTile } from "./BentoTile";

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  excellent: Zap,
  good: Smile,
  normal: Meh,
  low: Frown,
  bad: Moon,
};

const MOOD_COLORS: Record<MoodId, string> = {
  excellent: "text-[var(--success)]",
  good: "text-[var(--course-1-fg)]",
  normal: "text-[var(--text-muted)]",
  low: "text-[var(--warning)]",
  bad: "text-[var(--error)]",
};

const TREND_CONFIG = {
  stable: { Icon: Minus, labelKey: "trendStable" as const },
  up: { Icon: TrendingUp, labelKey: "trendUp" as const },
  down: { Icon: TrendingDown, labelKey: "trendDown" as const },
};

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function EmotionalWeekTile({ index = 2 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const todayIndex = getTodayIndex();
  const trend = TREND_CONFIG[WEEK_EMOTIONAL_TREND];
  const TrendIcon = trend.Icon;

  return (
    <BentoTile span={2} mdSpan={2} index={index} className="self-start">
      <WellbeingSectionHeading icon={Smile} title={t("emotionalWeekTitle")} />
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_MOODS.map(({ day, mood }, dayIndex) => {
          const isToday = dayIndex === todayIndex;
          const isBestDay = dayIndex === WEEK_BEST_DAY_INDEX;
          const Icon = mood ? MOOD_ICONS[mood] : null;

          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-1.5 transition-all duration-300 ${
                isBestDay
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 shadow-md ring-2 ring-[var(--app-primary)]/50"
                  : isToday
                    ? "border-[var(--app-primary)]/50 bg-[var(--app-surface)]"
                    : "border-[var(--app-border)] bg-[var(--app-surface)]"
              }`}
            >
              <span
                className={`text-[10px] font-medium ${
                  isBestDay
                    ? "font-semibold text-[var(--app-primary)]"
                    : isToday
                      ? "text-[var(--app-primary)]"
                      : "text-[var(--app-fg-muted)]"
                }`}
              >
                {day}
              </span>
              {Icon && mood ? (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isBestDay
                      ? "bg-[var(--app-primary)]"
                      : "bg-[var(--app-surface-soft)]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isBestDay ? "text-[var(--app-bg)]" : MOOD_COLORS[mood]
                    }`}
                    aria-hidden
                  />
                </div>
              ) : (
                <span className="text-sm text-[var(--app-fg-muted)]">—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-surface)] px-3 py-2 shadow-sm">
        <TrendIcon className="h-4 w-4 shrink-0 text-[var(--app-primary)]" aria-hidden />
        <span className="text-xs font-medium text-[var(--app-fg-secondary)]">
          {t("trendLabel")}: {t(trend.labelKey)}
        </span>
      </div>
    </BentoTile>
  );
}

/** @deprecated Use EmotionalWeekTile */
export const EmotionalWeekSection = EmotionalWeekTile;
