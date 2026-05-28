"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { Zap, Smile, Meh, Frown, Moon, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  getEmotionalCheckInHistory,
  getEmotionalCheckInSummary,
  type EmotionalHistoryEntry,
  type EmotionalSummaryDto,
} from "@/app/lib/emotional-checkins-api";
import type { MoodHeatmapCell, MoodId } from "../wellbeing-types";
import { HEATMAP_DAY_LABELS } from "../wellbeing-mock-data";
import { PastDayDetailModal } from "./PastDayDetailModal";

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  excellent: Zap,
  good: Smile,
  normal: Meh,
  low: Frown,
  bad: Moon,
};

const MOOD_CELL_CLASSES: Record<MoodId, string> = {
  excellent: "bg-[var(--app-primary)]",
  good: "bg-[var(--app-primary)]/70",
  normal: "bg-[var(--app-primary)]/35",
  low: "bg-[var(--warning)]/40",
  bad: "bg-[var(--error)]/40",
};

function buildHeatmapData(entries: EmotionalHistoryEntry[]): MoodHeatmapCell[] {
  const byDate = new Map(entries.map((e) => [e.checkInDate, e.mood as MoodId]));
  const cells: MoodHeatmapCell[] = [];
  for (let i = 69; i >= 0; i--) {
    const ymd = format(subDays(new Date(), i), "yyyy-MM-dd");
    cells.push(byDate.get(ymd) ?? null);
  }
  return cells;
}

function weekDayLabels(): string[] {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    labels.push(format(d, "EEEEE", { locale: es }).toUpperCase());
  }
  return labels;
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
  }
  return dates;
}

function getHeatmapDateByCell(cellIndex: number): string {
  return format(subDays(new Date(), 69 - cellIndex), "yyyy-MM-dd");
}

export function WellbeingProgressSection({ index = 3 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<EmotionalSummaryDto | null>(null);
  const [heatmap, setHeatmap] = useState<MoodHeatmapCell[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const delayStyle = { "--wellbeing-delay": `${index * 80}ms` } as React.CSSProperties;

  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const [sum, history] = await Promise.all([
          getEmotionalCheckInSummary(token),
          getEmotionalCheckInHistory(token),
        ]);
        if (!cancelled) {
          setSummary(sum);
          setHeatmap(buildHeatmapData(history));
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, token]);

  const weekLabels = weekDayLabels();
  const weekDates = getWeekDates();
  const insight = summary?.insights[0];

  return (
    <section className="wellbeing-calm-block border-t border-[var(--app-border)]/40 pt-8" style={delayStyle}>
      <details
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        className="group"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[var(--app-fg-secondary)] marker:content-none">
          <span className="text-base font-medium text-[var(--app-fg)]">{t("progress.title")}</span>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
        </summary>

        <div className="mt-6 space-y-6">
          {loading ? (
            <p className="text-sm text-[var(--app-fg-muted)]">{t("progress.loading")}</p>
          ) : summary ? (
            <>
              <p className="text-sm text-[var(--app-fg-secondary)]">
                {t("emotionalCheckInStreak", { count: summary.streak })}
              </p>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                  {t("emotionalWeekTitle")}
                </p>
                <div className="flex justify-between gap-1">
                  {summary.week.map((mood, i) => {
                    const Icon = mood ? MOOD_ICONS[mood] : null;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => mood && setSelectedDate(weekDates[i])}
                        disabled={!mood}
                        className="flex flex-col items-center gap-1 disabled:cursor-default"
                        title={mood ? t("progress.viewDay") : undefined}
                      >
                        <span className="text-[10px] text-[var(--app-fg-muted)]">
                          {weekLabels[i]}
                        </span>
                        {Icon ? (
                          <Icon className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
                        ) : (
                          <span className="h-5 w-5 rounded-full bg-[var(--app-surface-soft)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {insight ? (
                <p className="rounded-xl bg-[var(--app-primary)]/5 px-4 py-3 text-sm leading-relaxed text-[var(--app-fg-secondary)]">
                  {insight}
                </p>
              ) : null}

              {heatmap.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                    {t("moodHeatmapTitle")}
                  </p>
                  <div className="overflow-x-auto">
                    <div className="mb-1 grid grid-cols-7 gap-0.5">
                      {HEATMAP_DAY_LABELS.map((label) => (
                        <span
                          key={label}
                          className="w-2 text-center text-[8px] text-[var(--app-fg-muted)]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {heatmap.map((mood, cellIndex) => (
                        <button
                          key={cellIndex}
                          type="button"
                          onClick={() => mood && setSelectedDate(getHeatmapDateByCell(cellIndex))}
                          disabled={!mood}
                          title={mood ? t("progress.viewDay") : undefined}
                          className={`h-2 w-2 rounded-sm ${
                            mood ? MOOD_CELL_CLASSES[mood] : "bg-[var(--app-surface-soft)]"
                          } ${mood ? "cursor-pointer" : "cursor-default"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : open ? (
            <p className="text-sm text-[var(--app-fg-muted)]">{t("progress.empty")}</p>
          ) : null}
        </div>
      </details>
      <PastDayDetailModal
        open={selectedDate !== null}
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </section>
  );
}
