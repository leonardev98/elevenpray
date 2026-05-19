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
      <SectionLabel>TU CONSISTENCIA</SectionLabel>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-0">
              <div className="mb-1 grid grid-cols-7 gap-1 pl-0">
                {HEATMAP_DAY_LABELS.map((label) => (
                  <span
                    key={label}
                    className="w-2.5 text-center text-[10px] text-[var(--app-fg-muted)]"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {HEATMAP_DATA.map((level, index) => {
                  const weekIndex = Math.floor(index / 7);
                  const dayIndex = index % 7;
                  return (
                    <div
                      key={index}
                      title={getTooltip(weekIndex, dayIndex, level)}
                      className={`h-2.5 w-2.5 rounded-sm transition-colors ${LEVEL_CLASSES[level]}`}
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
                  className={`h-2.5 w-2.5 rounded-sm ${LEVEL_CLASSES[level]}`}
                />
              ))}
            </div>
            <span>→ Más</span>
          </div>
        </div>

        <div className="student-card flex shrink-0 flex-col gap-4 p-5 lg:w-52">
          <div className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-[var(--app-primary)]" aria-hidden />
            <div>
              <p className="text-xs text-[var(--app-fg-muted)]">Racha actual</p>
              <p className="text-sm font-semibold text-[var(--app-fg)]">
                {HEATMAP_STATS.currentStreak} días
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-[var(--app-primary)]" aria-hidden />
            <div>
              <p className="text-xs text-[var(--app-fg-muted)]">Mejor racha</p>
              <p className="text-sm font-semibold text-[var(--app-fg)]">
                {HEATMAP_STATS.bestStreak} días
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-[var(--app-primary)]" aria-hidden />
            <div>
              <p className="text-xs text-[var(--app-fg-muted)]">Este mes</p>
              <p className="text-sm font-semibold text-[var(--app-fg)]">
                {HEATMAP_STATS.activeDaysThisMonth} días activos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
