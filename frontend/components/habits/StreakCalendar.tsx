"use client";

import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

/** Normaliza una fecha a clave YYYY-MM-DD para comparaciones. */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

/** Racha actual: días consecutivos hasta hoy desde completedDays. */
function computeStreak(completedDays: Date[]): number {
  const set = new Set(completedDays.map(toDateKey));
  const today = new Date();
  let count = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    if (!set.has(toDateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Lunes = 0, Domingo = 6. Devuelve el lunes de la semana de la fecha. */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayOfWeek);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Los 7 días (Date) de la semana actual (lun–dom). */
function getCurrentWeekDays(): Date[] {
  const start = startOfWeek(new Date());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

type DayState = "completed" | "today" | "missed" | "future";

function getDayState(day: Date, completedSet: Set<string>, today: Date): DayState {
  const key = toDateKey(day);
  if (isSameDay(day, today)) return "today";
  if (day > today) return "future";
  return completedSet.has(key) ? "completed" : "missed";
}

const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export interface StreakCalendarProps {
  completedDays: Date[];
}

/**
 * Calendario de racha semanal: cabecera con racha actual + fila de 7 días
 * con estados completed / today / missed / future. Pensado para cards de hábitos (skincare, etc.).
 *
 * @example
 * const completed = checkins.map(c => new Date(c.checkinDate));
 * <StreakCalendar completedDays={completed} />
 */
export function StreakCalendar({ completedDays }: StreakCalendarProps) {
  const t = useTranslations("workspaceNav");
  const tDays = useTranslations("days");

  const completedSet = new Set(completedDays.map(toDateKey));
  const streak = computeStreak(completedDays);
  const weekDays = getCurrentWeekDays();
  const today = new Date();

  const cellClass = (state: DayState): string => {
    const base =
      "flex min-h-[2.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors ";
    switch (state) {
      case "completed":
        return base + "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white";
      case "today":
        return (
          base +
          "border-2 border-[var(--app-primary)] bg-[var(--app-bg)] text-[var(--app-fg)] dark:border-blue-500 dark:bg-[var(--app-surface-soft)] dark:text-[var(--app-fg)]"
        );
      case "missed":
        return (
          base +
          "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
        );
      case "future":
        return (
          base +
          "bg-[var(--app-bg)]/80 text-[var(--app-fg-muted)] dark:bg-zinc-800/80 dark:text-zinc-500"
        );
    }
  };

  return (
    <motion.div
      aria-labelledby="streak-calendar-heading"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
    >
      <h2
        id="streak-calendar-heading"
        className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" aria-hidden />
        {t("currentStreak")}
      </h2>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-normal text-[var(--app-navy)] dark:text-sky-400">
          {streak}
        </span>
        <span className="text-sm text-[var(--app-fg)]/80 dark:text-slate-300">
          {t("daysInARow")}
        </span>
      </div>
      <motion.div
        className="flex items-stretch gap-1"
        aria-label={t("thisWeek")}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {weekDays.map((day, i) => {
          const state = getDayState(day, completedSet, today);
          return (
            <motion.div
              key={toDateKey(day)}
              variants={staggerItem}
              className={cellClass(state)}
              title={state === "completed" ? "Completado" : state === "today" ? "Hoy" : state === "missed" ? "Pendiente" : "Futuro"}
            >
              <span className="text-[10px] font-medium uppercase text-current opacity-90">
                {tDays(WEEKDAY_KEYS[i])}
              </span>
              <span className="text-xs font-medium" aria-hidden>
                {state === "completed" ? "✔" : state === "today" ? "·" : "○"}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
