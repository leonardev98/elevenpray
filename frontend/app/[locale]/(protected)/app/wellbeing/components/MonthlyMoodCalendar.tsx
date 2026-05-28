"use client";

import { useMemo, useState } from "react";
import { addMonths, format, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EmotionalHistoryEntry } from "@/app/lib/emotional-checkins-api";
import type { MoodId } from "../wellbeing-types";
import { PastDayDetailModal } from "./PastDayDetailModal";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const MOOD_CELL_CLASSES: Record<MoodId, string> = {
  excellent: "bg-[var(--app-primary)]",
  good: "bg-[var(--app-primary)]/70",
  normal: "bg-[var(--app-primary)]/35",
  low: "bg-[var(--warning)]/40",
  bad: "bg-[var(--error)]/40",
};

function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type CalendarCell = {
  key: string;
  date: Date | null;
  dayNumber: number | null;
  mood: MoodId | null;
};

function buildMonthCells(history: EmotionalHistoryEntry[], viewMonth: Date): CalendarCell[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const byDate = new Map(
    history
      .filter((entry) => isSameMonth(new Date(`${entry.checkInDate}T00:00:00`), viewMonth))
      .map((entry) => [entry.checkInDate, entry.mood as MoodId]),
  );

  const cells: CalendarCell[] = [];
  for (let i = 0; i < mondayBasedOffset; i++) {
    cells.push({ key: `blank-${i}`, date: null, dayNumber: null, mood: null });
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const ymd = toYmd(date);
    cells.push({
      key: ymd,
      date,
      dayNumber: day,
      mood: byDate.get(ymd) ?? null,
    });
  }

  return cells;
}

export function MonthlyMoodCalendar({
  history,
  loading,
}: {
  history: EmotionalHistoryEntry[];
  loading: boolean;
}) {
  const t = useTranslations("studentWellbeing");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(new Date()));
  const cells = useMemo(() => buildMonthCells(history, viewMonth), [history, viewMonth]);
  const today = new Date();
  const canGoForward = !isSameMonth(viewMonth, today);
  const monthLabel = format(viewMonth, "MMMM yyyy", { locale: es });
  const monthLabelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <section className="rounded-2xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--app-fg)]">{t("moodHeatmapTitle")}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth((prev) => subMonths(prev, 1))}
            aria-label={t("moodHeatmapPrevMonth")}
            className="rounded-md border border-[var(--app-border)] p-1 text-[var(--app-fg-secondary)] transition hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
            aria-label={t("moodHeatmapNextMonth")}
            className="rounded-md border border-[var(--app-border)] p-1 text-[var(--app-fg-secondary)] transition hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--app-fg-secondary)]">{monthLabelCapitalized}</p>
      {loading ? (
        <p className="mt-3 text-sm text-[var(--app-fg-muted)]">{t("progress.loading")}</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-center text-[10px] font-semibold text-[var(--app-fg-muted)]"
              >
                {label}
              </span>
            ))}
            {cells.map((cell) => {
              if (!cell.date || !cell.dayNumber) {
                return <span key={cell.key} className="h-8 w-full" aria-hidden />;
              }
              const moodLabel = cell.mood ? t(`moods.${cell.mood}`) : t("noMoodRecord");
              const isToday = isSameDay(cell.date, today);
              const dayTitle = format(cell.date, "d 'de' MMMM", { locale: es });
              return (
                <button
                  key={cell.key}
                  type="button"
                  title={`${dayTitle}: ${moodLabel}`}
                  onClick={() => setSelectedDate(toYmd(cell.date))}
                  className={`h-8 rounded-lg text-xs font-medium transition ${
                    cell.mood
                      ? `${MOOD_CELL_CLASSES[cell.mood]} text-[var(--app-bg)] hover:opacity-90`
                      : "bg-[var(--app-surface-soft)] text-[var(--app-fg-muted)] hover:bg-[var(--app-border)]/50"
                  } ${isToday ? "ring-2 ring-[var(--app-primary)] ring-offset-1 ring-offset-[var(--app-surface)]" : ""}`}
                >
                  {cell.dayNumber}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--app-fg-muted)]">
            <span>{t("moodHeatmapLess")}</span>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-[4px] bg-[var(--warning)]/40" />
              <span className="h-3 w-3 rounded-[4px] bg-[var(--app-primary)]/35" />
              <span className="h-3 w-3 rounded-[4px] bg-[var(--app-primary)]/70" />
              <span className="h-3 w-3 rounded-[4px] bg-[var(--app-primary)]" />
            </div>
            <span>{t("moodHeatmapMore")}</span>
          </div>
        </>
      )}
      <PastDayDetailModal
        open={selectedDate !== null}
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </section>
  );
}
