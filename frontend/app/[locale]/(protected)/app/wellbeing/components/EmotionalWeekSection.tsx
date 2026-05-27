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
  excellent: "text-[var(--success)]",
  good: "text-[var(--course-1-fg)]",
  normal: "text-[var(--text-muted)]",
  low: "text-[var(--warning)]",
  bad: "text-[var(--error)]",
};

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function EmotionalWeekSection() {
  const todayIndex = getTodayIndex();

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Smile className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Tu Semana Emocional
        </h2>
      </div>
      <div className="rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition-all duration-300 hover:shadow-lg">
        <div className="grid grid-cols-7 gap-2 overflow-x-auto">
          {WEEK_MOODS.map(({ day, mood }, index) => {
            const isToday = index === todayIndex;
            const Icon = mood ? MOOD_ICONS[mood] : null;

            return (
              <div
                key={day}
                className={`flex min-w-[3rem] flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all duration-300 ${
                  isToday
                    ? "border-[var(--app-primary)] bg-[var(--app-primary)]/10 shadow-md scale-105"
                    : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/40 hover:shadow-sm"
                }`}
              >
                <span className={`text-[10px] font-medium ${isToday ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)]"}`}>{day}</span>
                {Icon && mood ? (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                    isToday ? "bg-[var(--app-primary)]" : "bg-[var(--app-surface-soft)]"
                  }`}>
                    <Icon className={`h-5 w-5 transition-colors duration-300 ${
                      isToday ? "text-[var(--app-bg)]" : MOOD_COLORS[mood]
                    }`} aria-hidden />
                  </div>
                ) : (
                  <span className="text-sm text-[var(--app-fg-muted)]">—</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl bg-[var(--app-surface)] p-3 text-center shadow-sm">
          <p className="text-sm text-[var(--app-fg-secondary)]">{WEEK_INSIGHT}</p>
        </div>
      </div>
    </section>
  );
}
