"use client";

import { Zap, Smile, Meh, Frown, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MoodId } from "../wellbeing-types";
import { WEEK_INSIGHT, WEEK_MOODS } from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  excellent: Zap,
  good: Smile,
  normal: Meh,
  low: Frown,
  bad: Moon,
};

const MOOD_COLORS: Record<MoodId, string> = {
  excellent: "text-green-400",
  good: "text-teal-400",
  normal: "text-[var(--app-fg-muted)]",
  low: "text-amber-400",
  bad: "text-red-400",
};

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function EmotionalWeekSection() {
  const todayIndex = getTodayIndex();

  return (
    <section>
      <SectionLabel>TU SEMANA EMOCIONAL</SectionLabel>
      <div className="grid grid-cols-7 gap-2 overflow-x-auto">
        {WEEK_MOODS.map(({ day, mood }, index) => {
          const isToday = index === todayIndex;
          const Icon = mood ? MOOD_ICONS[mood] : null;

          return (
            <div
              key={day}
              className={`flex min-w-[2.5rem] flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all duration-150 ${
                isToday
                  ? "border-[var(--app-primary)]/60 bg-[var(--app-surface-elevated)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface-soft)]"
              }`}
            >
              <span className="text-[10px] text-[var(--app-fg-muted)]">{day}</span>
              {Icon && mood ? (
                <Icon className={`h-5 w-5 ${MOOD_COLORS[mood]}`} aria-hidden />
              ) : (
                <span className="text-sm text-[var(--app-fg-muted)]">—</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-[var(--app-fg-muted)]">{WEEK_INSIGHT}</p>
    </section>
  );
}
