"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentTasks } from "../../context/student-tasks-context";
import {
  buildCalendarWeekDays,
  startOfWeekMonday,
  tasksToCalendarChips,
} from "../../lib/map-assignment";
import type { CalendarChip } from "../../lib/task-types";
import { getCourseStyle, PRIORITY_LABELS } from "../../lib/task-styles";
import { TasksCalendarSkeleton } from "../TasksSkeleton";

function toDateIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
  return `${fmt.format(weekStart)} – ${fmt.format(end)}`;
}

export function TasksCalendarView() {
  const { filteredTasks, loading } = useStudentTasks();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [activeChip, setActiveChip] = useState<CalendarChip | null>(null);

  const weekDays = useMemo(() => buildCalendarWeekDays(weekStart), [weekStart]);
  const chipsByDay = useMemo(() => tasksToCalendarChips(filteredTasks), [filteredTasks]);
  const todayIso = toDateIsoLocal(new Date());

  function shiftWeek(delta: number) {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
    setActiveChip(null);
  }

  if (loading) return <TasksCalendarSkeleton />;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={() => shiftWeek(-1)}
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-sm font-medium text-[var(--app-fg)]">{formatWeekRange(weekStart)}</p>
        <button
          type="button"
          aria-label="Semana siguiente"
          onClick={() => shiftWeek(1)}
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </header>

      <motion.div
        key={weekStart.toISOString()}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
        className="grid grid-cols-7 gap-2"
      >
        {weekDays.map((day) => {
          const chips = chipsByDay[day.iso] ?? [];
          const isToday = day.iso === todayIso;
          const visible = chips.slice(0, 2);
          const overflow = chips.length - visible.length;

          return (
            <div
              key={day.iso}
              className="min-h-[120px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)]/40 p-2"
            >
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
                {visible.map((chip) => {
                  const task = filteredTasks.find((t) => t.id === chip.taskId);
                  const chipStyle = task
                    ? getCourseStyle(task.courseColorToken).chip
                    : getCourseStyle("blue").chip;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActiveChip(chip)}
                      className={cn(
                        "w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-medium transition-transform hover:scale-[1.02]",
                        chipStyle,
                      )}
                    >
                      {chip.shortLabel}
                    </button>
                  );
                })}
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
      </motion.div>
    </div>
  );
}
