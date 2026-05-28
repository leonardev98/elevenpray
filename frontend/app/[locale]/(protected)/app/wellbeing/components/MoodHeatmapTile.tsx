"use client";

import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import type { MoodHeatmapCell, MoodId } from "../wellbeing-types";
import {
  getMoodLabel,
  HEATMAP_DAY_LABELS,
  MOOD_HEATMAP_DATA,
} from "../wellbeing-mock-data";
import { WellbeingSectionHeading } from "./WellbeingSectionHeading";
import { BentoTile } from "./BentoTile";

const MOOD_CELL_CLASSES: Record<MoodId, string> = {
  excellent: "bg-[var(--app-primary)]",
  good: "bg-[var(--app-primary)]/70",
  normal: "bg-[var(--app-primary)]/35",
  low: "bg-[var(--warning)]/40",
  bad: "bg-[var(--error)]/40",
};

const LEGEND_CELLS: MoodHeatmapCell[] = ["bad", "low", "normal", "good", "excellent"];

function getCellDate(weekIndex: number, dayIndex: number): Date {
  const cellIndex = weekIndex * 7 + dayIndex;
  const daysFromEnd = 69 - cellIndex;
  return subDays(new Date(), daysFromEnd);
}

function getTooltip(
  weekIndex: number,
  dayIndex: number,
  mood: MoodHeatmapCell,
  noRecordLabel: string,
): string {
  const date = getCellDate(weekIndex, dayIndex);
  const dayName = format(date, "EEEE d MMMM", { locale: es });
  const capitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  if (!mood) return `${capitalized} — ${noRecordLabel}`;
  return `${capitalized} — ${getMoodLabel(mood)}`;
}

export function MoodHeatmapTile({ index = 1 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");

  return (
    <BentoTile span={2} mdSpan={2} index={index} className="self-start">
      <WellbeingSectionHeading icon={Calendar} title={t("moodHeatmapTitle")} />
      <div className="overflow-x-auto">
        <div className="inline-block min-w-0">
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {HEATMAP_DAY_LABELS.map((label) => (
              <span
                key={label}
                className="w-3.5 text-center text-[10px] font-medium text-[var(--app-fg-muted)] lg:w-4"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {MOOD_HEATMAP_DATA.map((mood, index) => {
              const weekIndex = Math.floor(index / 7);
              const dayIndex = index % 7;
              const cellClass = mood
                ? MOOD_CELL_CLASSES[mood]
                : "bg-[var(--app-surface-soft)]";
              return (
                <div
                  key={index}
                  title={getTooltip(weekIndex, dayIndex, mood, t("noMoodRecord"))}
                  className={`h-3.5 w-3.5 rounded-md transition-all duration-200 hover:scale-125 lg:h-4 lg:w-4 ${cellClass}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--app-fg-muted)]">
        <span>{t("moodHeatmapLess")}</span>
        <div className="flex gap-1">
          {LEGEND_CELLS.map((mood, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-md lg:h-4 lg:w-4 ${
                mood ? MOOD_CELL_CLASSES[mood] : "bg-[var(--app-surface-soft)]"
              }`}
            />
          ))}
        </div>
        <span>{t("moodHeatmapMore")}</span>
      </div>
    </BentoTile>
  );
}
