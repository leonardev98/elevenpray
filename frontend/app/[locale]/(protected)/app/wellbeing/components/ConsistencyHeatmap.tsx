"use client";

import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Flame, Star, Calendar } from "lucide-react";
import type { HeatmapLevel } from "../wellbeing-types";
import {
  HEATMAP_DATA,
  HEATMAP_DAY_LABELS,
  HEATMAP_STATS,
  SESSION_LABELS,
} from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";

const LEVEL_CLASSES: Record<HeatmapLevel, string> = {
  0: "bg-[var(--app-surface-soft)]",
  1: "bg-[var(--app-primary)]/20",
  2: "bg-[var(--app-primary)]/50",
  3: "bg-[var(--app-primary)]",
};

function getCellDate(weekIndex: number, dayIndex: number): Date {
  const cellIndex = weekIndex * 7 + dayIndex;
  const daysFromEnd = 69 - cellIndex;
  return subDays(new Date(), daysFromEnd);
}

function getTooltip(weekIndex: number, dayIndex: number, level: HeatmapLevel): string {
  const date = getCellDate(weekIndex, dayIndex);
  const dayName = format(date, "EEEE d MMMM", { locale: es });
  const sessions = SESSION_LABELS[level];
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} — ${sessions}`;
}

export function ConsistencyHeatmap() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Tu Consistencia
        </h2>
      </div>
      <div className="rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-0">
                <div className="mb-2 grid grid-cols-7 gap-1.5 pl-0">
                  {HEATMAP_DAY_LABELS.map((label) => (
                    <span
                      key={label}
                      className="w-3 text-center text-[10px] font-medium text-[var(--app-fg-muted)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {HEATMAP_DATA.map((level, index) => {
                    const weekIndex = Math.floor(index / 7);
                    const dayIndex = index % 7;
                    return (
                      <div
                        key={index}
                        title={getTooltip(weekIndex, dayIndex, level)}
                        className={`h-3 w-3 rounded-md transition-all duration-200 hover:scale-125 ${LEVEL_CLASSES[level]}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-[var(--app-fg-muted)]">
              <span>Menos ←</span>
              <div className="flex gap-1">
                {([0, 1, 2, 3] as HeatmapLevel[]).map((level) => (
                  <div
                    key={level}
                    className={`h-3 w-3 rounded-md ${LEVEL_CLASSES[level]}`}
                  />
                ))}
              </div>
              <span>→ Más</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:w-52">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--app-surface)] p-3 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary)]/10">
                <Flame className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-[var(--app-fg-muted)]">Racha actual</p>
                <p className="text-sm font-semibold text-[var(--app-fg)]">
                  {HEATMAP_STATS.currentStreak} días
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[var(--app-surface)] p-3 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary)]/10">
                <Star className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-[var(--app-fg-muted)]">Mejor racha</p>
                <p className="text-sm font-semibold text-[var(--app-fg)]">
                  {HEATMAP_STATS.bestStreak} días
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[var(--app-surface)] p-3 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary)]/10">
                <Calendar className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
              </div>
              <div>
                <p className="text-xs text-[var(--app-fg-muted)]">Este mes</p>
                <p className="text-sm font-semibold text-[var(--app-fg)]">
                  {HEATMAP_STATS.activeDaysThisMonth} días activos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
