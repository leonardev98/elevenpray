"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CALENDAR_CHIPS_BY_DAY,
  CALENDAR_TODAY_ISO,
  CALENDAR_WEEK_DAYS,
  type CalendarChip,
} from "../../lib/tasks-mock-data";
import { COURSE_STYLES, PRIORITY_LABELS } from "../../lib/task-styles";

export function TasksCalendarView() {
  const [activeChip, setActiveChip] = useState<CalendarChip | null>(null);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          aria-label="Semana anterior"
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-[var(--app-fg)]">19 – 25 mayo 2026</p>
        <button
          type="button"
          aria-label="Semana siguiente"
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>

      <div className="grid grid-cols-7 gap-2">
        {CALENDAR_WEEK_DAYS.map((day) => {
          const chips = CALENDAR_CHIPS_BY_DAY[day.iso] ?? [];
          const isToday = day.iso === CALENDAR_TODAY_ISO;
          const visible = chips.slice(0, 2);
          const overflow = chips.length - visible.length;

          return (
            <div key={day.iso} className="min-h-[120px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)]/40 p-2">
              <div
                className={cn(
                  "mb-2 flex flex-col items-center rounded-lg py-1 text-center",
                  isToday && "bg-[var(--app-primary-soft)]",
                )}
              >
                <span className="text-[10px] font-medium text-[var(--app-fg-muted)]">{day.letter}</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isToday ? "text-[var(--app-primary)]" : "text-[var(--app-fg)]",
                  )}
                >
                  {day.dayNum}
                </span>
              </div>

              <div className="relative space-y-1">
                {visible.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActiveChip(chip)}
                    className={cn(
                      "w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-medium",
                      COURSE_STYLES[chip.courseCode].chip,
                    )}
                  >
                    {chip.shortLabel}
                  </button>
                ))}
                {overflow > 0 && (
                  <p className="text-[10px] text-[var(--app-fg-muted)]">+ {overflow} más</p>
                )}

                {activeChip && visible.some((c) => c.id === activeChip.id) && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 shadow-lg">
                    <p className="text-xs font-semibold text-[var(--app-fg)]">{activeChip.fullTitle}</p>
                    <p className="mt-1 text-[10px] text-[var(--app-fg-muted)]">
                      {activeChip.courseCode} · {activeChip.estimatedLabel}
                    </p>
                    <p className="text-[10px] text-[var(--app-fg-muted)]">
                      Prioridad: {PRIORITY_LABELS[activeChip.priority]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
