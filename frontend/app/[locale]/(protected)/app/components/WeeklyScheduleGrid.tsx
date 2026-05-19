"use client";

import { useMemo } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  type MockScheduleEvent,
  type ScheduleEventKind,
} from "../lib/mock-student-data";

const DAY_START_MINUTES = 7 * 60;
const DAY_END_MINUTES = 22 * 60;
const SLOT_MINUTES = 30;
const PIXELS_PER_MINUTE = 1.2;
const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
const GRID_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE;
const TIME_AXIS_WIDTH = 64;
const GAP_PX = 3;

const KIND_TAG: Record<ScheduleEventKind, string> = {
  class: "bg-[var(--schedule-class-tag)] text-violet-200",
  task: "bg-[var(--schedule-task-tag)] text-teal-200",
  extra: "bg-[var(--schedule-extra-tag)] text-amber-200",
  exam: "bg-[var(--schedule-exam-tag)] text-rose-200",
};

const KIND_BG: Record<ScheduleEventKind, string> = {
  class: "var(--schedule-class-bg)",
  task: "var(--schedule-task-bg)",
  extra: "var(--schedule-extra-bg)",
  exam: "var(--schedule-exam-bg)",
};

const KIND_BORDER: Record<ScheduleEventKind, string> = {
  class: "var(--schedule-class-border)",
  task: "var(--schedule-task-border)",
  extra: "var(--schedule-extra-border)",
  exam: "var(--schedule-exam-border)",
};

const KIND_STRONG: Record<ScheduleEventKind, string> = {
  class: "var(--schedule-class-strong)",
  task: "var(--schedule-task-strong)",
  extra: "var(--schedule-extra-strong)",
  exam: "var(--schedule-exam-strong)",
};

function timeToMinutes(value: string): number {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function eventsOverlap(
  a: { startMin: number; endMin: number },
  b: { startMin: number; endMin: number },
): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

type TimedEvent = MockScheduleEvent & { startMin: number; endMin: number };
type LaidOutEvent = TimedEvent & { column: number; totalColumns: number };

function layoutDayEvents(events: MockScheduleEvent[]): LaidOutEvent[] {
  const items: TimedEvent[] = events
    .map((e) => ({
      ...e,
      startMin: timeToMinutes(e.startTime),
      endMin: timeToMinutes(e.endTime),
    }))
    .filter((e) => e.endMin > e.startMin)
    .sort((a, b) => a.startMin - b.startMin);

  if (items.length === 0) return [];

  const clusters: TimedEvent[][] = [];
  for (const ev of items) {
    let merged = false;
    for (const cluster of clusters) {
      if (cluster.some((c) => eventsOverlap(c, ev))) {
        cluster.push(ev);
        merged = true;
        break;
      }
    }
    if (!merged) clusters.push([ev]);
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const overlaps = clusters[i].some((a) =>
          clusters[j].some((b) => eventsOverlap(a, b)),
        );
        if (overlaps) {
          clusters[i] = [...clusters[i], ...clusters[j]];
          clusters.splice(j, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  const result: LaidOutEvent[] = [];
  for (const cluster of clusters) {
    const columnEnds: number[] = [];
    const assigned: { ev: TimedEvent; col: number }[] = [];
    for (const ev of [...cluster].sort((a, b) => a.startMin - b.startMin)) {
      let col = columnEnds.findIndex((end) => end <= ev.startMin);
      if (col === -1) {
        col = columnEnds.length;
        columnEnds.push(ev.endMin);
      } else {
        columnEnds[col] = ev.endMin;
      }
      assigned.push({ ev, col });
    }
    const totalColumns = columnEnds.length;
    for (const { ev, col } of assigned) {
      result.push({ ...ev, column: col, totalColumns });
    }
  }
  return result;
}

function formatHourLabel(minutes: number, locale: "es" | "en"): string {
  const h = Math.floor(minutes / 60);
  if (locale === "es") {
    return `${String(h).padStart(2, "0")}:00`;
  }
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface WeeklyScheduleGridProps {
  weekStart: Date;
  events: MockScheduleEvent[];
  onSlotClick: (dateKey: string, startTime: string) => void;
  onEventClick: (eventId: string) => void;
}

export function WeeklyScheduleGrid({
  weekStart,
  events,
  onSlotClick,
  onEventClick,
}: WeeklyScheduleGridProps) {
  const t = useTranslations("studentCalendar");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;

  const today = useMemo(() => new Date(), []);
  const todayKey = ymd(today);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return { date, key: ymd(date), isToday: isSameDay(date, today) };
      }),
    [weekStart, today],
  );

  const hourMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = DAY_START_MINUTES; m <= DAY_END_MINUTES; m += 60) marks.push(m);
    return marks;
  }, []);

  const slotMarks = useMemo(() => {
    const marks: number[] = [];
    for (let m = DAY_START_MINUTES; m < DAY_END_MINUTES; m += SLOT_MINUTES) marks.push(m);
    return marks;
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MockScheduleEvent[]>();
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    const out = new Map<string, LaidOutEvent[]>();
    for (const [key, list] of map) out.set(key, layoutDayEvents(list));
    return out;
  }, [events]);

  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const showNowLine =
    nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_END_MINUTES;
  const todayIndex = weekDays.findIndex((d) => d.isToday);

  return (
    <div className="schedule-week student-card flex flex-col overflow-hidden">
      {/* Cabecera de días */}
      <div
        className="grid sticky top-0 z-10 border-b border-[var(--app-border)] bg-[var(--app-surface-elevated)]"
        style={{ gridTemplateColumns: `${TIME_AXIS_WIDTH}px repeat(7, minmax(0, 1fr))` }}
      >
        <div className="px-3 py-3 text-[10px] uppercase tracking-wider text-[var(--app-fg-muted)]" />
        {weekDays.map((d) => (
          <div
            key={d.key}
            className={cn(
              "flex flex-col items-start gap-0.5 border-l border-[var(--app-border)] px-3 py-3",
              d.isToday && "bg-[var(--app-primary)]/5",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                d.isToday ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)]",
              )}
            >
              {format(d.date, "EEE", { locale: dateFnsLocale })}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xl font-semibold",
                  d.isToday ? "text-[var(--app-primary)]" : "text-[var(--app-fg)]",
                )}
              >
                {format(d.date, "d")}
              </span>
              {d.isToday && (
                <span className="rounded-full bg-[var(--app-primary)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--app-primary)]">
                  {t("today")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cuerpo de grid */}
      <div className="relative overflow-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `${TIME_AXIS_WIDTH}px repeat(7, minmax(0, 1fr))`,
            minHeight: GRID_HEIGHT,
          }}
        >
          {/* Eje de tiempo */}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourMarks.map((min) => (
              <div
                key={min}
                className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-[var(--app-fg-muted)]"
                style={{ top: (min - DAY_START_MINUTES) * PIXELS_PER_MINUTE }}
              >
                {formatHourLabel(min, locale)}
              </div>
            ))}
          </div>

          {/* Columnas por día */}
          {weekDays.map((d) => {
            const dayLaid = eventsByDay.get(d.key) ?? [];
            return (
              <div
                key={d.key}
                className={cn(
                  "relative border-l border-[var(--app-border)]",
                  d.isToday && "bg-[var(--app-primary)]/[0.03]",
                )}
                style={{ height: GRID_HEIGHT }}
              >
                {/* Líneas horarias de fondo */}
                {hourMarks.map((min) => (
                  <div
                    key={min}
                    className="pointer-events-none absolute left-0 right-0 border-t border-[var(--app-border)]/60"
                    style={{ top: (min - DAY_START_MINUTES) * PIXELS_PER_MINUTE }}
                  />
                ))}

                {/* Slots clickeables */}
                {slotMarks.map((min) => (
                  <button
                    type="button"
                    key={min}
                    onClick={() => onSlotClick(d.key, minutesToTime(min))}
                    className="schedule-grid-cell absolute left-0 right-0"
                    style={{
                      top: (min - DAY_START_MINUTES) * PIXELS_PER_MINUTE,
                      height: SLOT_MINUTES * PIXELS_PER_MINUTE,
                    }}
                    aria-label={`${format(d.date, "EEE d", { locale: dateFnsLocale })} ${minutesToTime(min)}`}
                  />
                ))}

                {/* Línea ahora */}
                {d.isToday && showNowLine && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                    style={{
                      top: (nowMinutes - DAY_START_MINUTES) * PIXELS_PER_MINUTE,
                    }}
                  >
                    <div className="-ml-1.5 h-3 w-3 shrink-0 rounded-full bg-[var(--app-primary)] shadow-[0_0_0_3px_rgba(110,181,168,0.25)]" />
                    <div className="h-0.5 flex-1 bg-[var(--app-primary)]" />
                  </div>
                )}

                {/* Eventos */}
                {dayLaid.map((event) => {
                  const top = (event.startMin - DAY_START_MINUTES) * PIXELS_PER_MINUTE;
                  const height = Math.max(
                    (event.endMin - event.startMin) * PIXELS_PER_MINUTE - GAP_PX,
                    28,
                  );
                  const widthPct = 100 / event.totalColumns;
                  const leftPct = (event.column / event.totalColumns) * 100;
                  return (
                    <button
                      type="button"
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.id);
                      }}
                      className="schedule-event-block z-10 text-[var(--app-fg)]"
                      style={{
                        position: "absolute",
                        top,
                        height,
                        left: `calc(${leftPct}% + ${GAP_PX / 2}px)`,
                        width: `calc(${widthPct}% - ${GAP_PX}px)`,
                        background: KIND_BG[event.kind],
                        borderColor: KIND_BORDER[event.kind],
                        // @ts-expect-error CSS variable
                        "--schedule-strong": KIND_STRONG[event.kind],
                      }}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="truncate pl-1 text-[11px] font-semibold leading-tight">
                          {event.title}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1 py-0.5 text-[9px] font-medium",
                            KIND_TAG[event.kind],
                          )}
                        >
                          {t(`eventKind.${event.kind}`)}
                        </span>
                      </div>
                      {event.subtitle && height > 36 && (
                        <p className="mt-0.5 truncate pl-1 text-[10px] text-[var(--app-fg-secondary)]">
                          {event.subtitle}
                        </p>
                      )}
                      {height > 52 && (
                        <p className="mt-0.5 pl-1 text-[10px] tabular-nums text-[var(--app-fg-muted)]">
                          {event.startTime.slice(0, 5)} – {event.endTime.slice(0, 5)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint vacío */}
      {events.length === 0 && (
        <div className="border-t border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2 text-center text-xs text-[var(--app-fg-secondary)]">
          {t("emptyHint")}
        </div>
      )}
    </div>
  );
}
