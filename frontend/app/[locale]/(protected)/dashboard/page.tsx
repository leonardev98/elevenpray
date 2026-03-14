"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../providers/auth-provider";
import { getDashboardWeek } from "../../../lib/dashboard-api";
import type { DashboardWeekResponse } from "../../../lib/dashboard-api";
import { DayDrawer } from "./components/day-drawer";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function getCurrentWeek(): { year: number; week: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return { year: now.getFullYear(), week };
}

/** Rango de fechas (lun–dom) para una semana ISO dada. */
function getWeekDateRange(
  year: number,
  week: number
): { from: string; to: string } {
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay() || 7;
  const mondayWeek1 = new Date(year, 0, 2 - dayOfWeek);
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: toLocalDateString(monday),
    to: toLocalDateString(sunday),
  };
}

/** Info de cada día de la semana calculada en cliente (sin API) para mostrar al instante. */
function buildWeekDaysInstant(
  year: number,
  week: number,
  dayLabels: Record<string, string>
): { dayKey: (typeof DAY_KEYS)[number]; dateStr: string; dayLabel: string; dayNum: string; isToday: boolean }[] {
  const { from } = getWeekDateRange(year, week);
  const [y, m, d] = from.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const todayStr = toLocalDateString(new Date());
  return DAY_KEYS.map((dayKey, i) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    const dateStr = toLocalDateString(dayDate);
    return {
      dayKey,
      dateStr,
      dayLabel: dayLabels[dayKey],
      dayNum: dateStr.slice(8, 10),
      isToday: dateStr === todayStr,
    };
  });
}

function formatDateRange(
  from: string,
  to: string,
  dayLabels: Record<string, string>,
  monthShort: Record<number, string>
): string {
  const [yFrom, mFrom, dFrom] = from.split("-").map(Number);
  const [yTo, mTo, dTo] = to.split("-").map(Number);
  const start = new Date(yFrom, mFrom - 1, dFrom);
  const end = new Date(yTo, mTo - 1, dTo);
  const dayStart = dayLabels[DAY_KEYS[start.getDay() === 0 ? 6 : start.getDay() - 1]] ?? "";
  const dayEnd = dayLabels[DAY_KEYS[end.getDay() === 0 ? 6 : end.getDay() - 1]] ?? "";
  const sameYear = start.getFullYear() === end.getFullYear();
  return sameYear
    ? `${dayStart} ${start.getDate()} ${monthShort[start.getMonth()]} – ${dayEnd} ${end.getDate()} ${monthShort[end.getMonth()]} ${end.getFullYear()}`
    : `${dayStart} ${start.getDate()} ${monthShort[start.getMonth()]} ${start.getFullYear()} – ${dayEnd} ${end.getDate()} ${monthShort[end.getMonth()]} ${end.getFullYear()}`;
}

function hasRoutineContent(r: DashboardWeekResponse["routineDays"][0]): boolean {
  if (r.groups?.some((g) => g.items.length > 0)) return true;
  return (r.items?.length ?? 0) > 0;
}

/** Fecha en YYYY-MM-DD en hora local (evita desfase con UTC). */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDayMap(
  data: DashboardWeekResponse,
  dayLabels: Record<string, string>
): Map<
  string,
  {
    dateStr: string;
    dayLabel: string;
    routines: {
      topicTitle: string;
      workspaceTitle?: string;
      groups?: { title: string; time?: string; items: { content: string }[] }[];
      items?: { content: string }[];
    }[];
    entries: { topicTitle: string; content: string | null }[];
  }
> {
  const map = new Map();
  const [y, m, d] = data.from.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  for (let i = 0; i < DAY_KEYS.length; i++) {
    const dayKey = DAY_KEYS[i];
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    const dateStr = toLocalDateString(dayDate);
    const routines = data.routineDays
      .filter((r) => r.dayKey === dayKey && hasRoutineContent(r))
      .map((r) => {
        const title = "workspaceTitle" in r ? r.workspaceTitle : (r as { topicTitle?: string }).topicTitle ?? "";
        if (r.groups?.length) {
          return {
            topicTitle: title,
            workspaceTitle: title,
            groups: r.groups.map((g) => ({
              title: g.title,
              time: g.time,
              items: g.items.map((it) => ({ content: it.content })),
            })),
          };
        }
        return { topicTitle: title, workspaceTitle: title, items: r.items };
      });
    const entries = data.entries
      .filter((e) => e.entryDate === dateStr)
      .map((e) => ({
        topicTitle: "workspaceTitle" in e ? e.workspaceTitle : (e as { topicTitle?: string }).topicTitle ?? "",
        content: e.content,
      }));
    map.set(dayKey, {
      dateStr,
      dayLabel: dayLabels[dayKey],
      routines,
      entries,
    });
  }
  return map;
}

function getTodayDayKey(data: DashboardWeekResponse | null): string | null {
  if (!data) return null;
  const today = toLocalDateString(new Date());
  const [y, m, d] = data.from.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  for (let i = 0; i < DAY_KEYS.length; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    if (toLocalDateString(dayDate) === today) return DAY_KEYS[i];
  }
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [data, setData] = useState<DashboardWeekResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(() => getCurrentWeek().year);
  const [week, setWeek] = useState(() => getCurrentWeek().week);
  /** Año/semana a los que pertenece `data` (para saber si mostrar contenido real o skeleton). */
  const [dataYear, setDataYear] = useState<number | null>(null);
  const [dataWeek, setDataWeek] = useState<number | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState(0);
  const t = useTranslations("dashboard");
  const tErrors = useTranslations("errors");
  const tDays = useTranslations("days");
  const tMonths = useTranslations("months.short");
  const dayLabels = useMemo(
    () => Object.fromEntries(DAY_KEYS.map((k) => [k, tDays(k)])),
    [tDays]
  );
  const monthShort = useMemo(
    () =>
      Object.fromEntries(
        Array.from({ length: 12 }, (_, i) => [i, tMonths(String(i))])
      ) as Record<number, string>,
    [tMonths]
  );

  useEffect(() => {
    if (!token) return;
    const ac = new AbortController();
    setLoading(true);
    setError("");
    getDashboardWeek(token, year, week, ac.signal)
      .then((res) => {
        if (!ac.signal.aborted) {
          setData(res);
          setDataYear(year);
          setDataWeek(week);
        }
      })
      .catch((e) => {
        if (ac.signal.aborted) return;
        if (e instanceof Error && e.message === "Unauthorized") {
          logout();
          router.replace("/login");
          return;
        }
        setError(e instanceof Error ? e.message : tErrors("loadDashboard"));
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [token, year, week, logout, router, tErrors]);

  const dataMatchesView = dataYear === year && dataWeek === week;
  const dayMap = data && dataMatchesView ? buildDayMap(data, dayLabels) : null;
  const todayKey = data && dataMatchesView ? getTodayDayKey(data) : null;
  const selectedDay = selectedDayKey && dayMap ? dayMap.get(selectedDayKey) ?? null : null;

  /** Días de la semana calculados en cliente para mostrar al instante (sin esperar API). */
  const weekDaysInstant = useMemo(
    () => buildWeekDaysInstant(year, week, dayLabels),
    [year, week, dayLabels]
  );

  const isCurrentWeek =
    year === getCurrentWeek().year && week === getCurrentWeek().week;
  const currWeek = getCurrentWeek();
  const routineTodaySummaries =
    dataYear === currWeek.year && dataWeek === currWeek.week
      ? (data?.workspaceSummaries?.filter((s) => s.kind === "routine_today") ?? [])
      : [];

  if (loading && !data) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-sm text-[var(--app-fg)]/60">{t("loadingWeek")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-fg)]/70">
            {dataMatchesView && data
              ? formatDateRange(data.from, data.to, dayLabels, monthShort)
              : dataYear !== null && dataWeek !== null
                ? formatDateRange(
                    getWeekDateRange(year, week).from,
                    getWeekDateRange(year, week).to,
                    dayLabels,
                    monthShort
                  )
                : "—"}
            {loading && (
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--app-navy)] border-t-transparent" aria-hidden />
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (todayKey) setSelectedDayKey(todayKey);
            }}
            className="min-h-[44px] rounded-lg border border-[var(--app-navy)] bg-[var(--app-navy)]/10 px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-navy)]/20 disabled:opacity-50"
            disabled={!todayKey}
          >
            {t("myDayToday")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDayKey(null);
              setSlideDirection(-1);
              if (week <= 1) {
                setYear((y) => y - 1);
                setWeek(52);
              } else {
                setWeek((w) => w - 1);
              }
            }}
            className="min-h-[44px] rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            {t("prevWeek")}
          </button>
          <button
            type="button"
            onClick={() => {
              const curr = getCurrentWeek();
              setSlideDirection(1);
              setYear(curr.year);
              setWeek(curr.week);
            }}
            className="min-h-[44px] rounded-lg border border-[var(--app-navy)]/60 bg-[var(--app-navy)]/10 px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-navy)]/15 disabled:opacity-50"
            disabled={isCurrentWeek}
          >
            {t("currentWeek")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDayKey(null);
              setSlideDirection(1);
              if (week >= 52) {
                setYear((y) => y + 1);
                setWeek(1);
              } else {
                setWeek((w) => w + 1);
              }
            }}
            className="min-h-[44px] rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            {t("nextWeek")}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {routineTodaySummaries.length > 0 && (
        <section className="mt-4" aria-label={t("todayRoutineAriaLabel")}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            {t("today")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {routineTodaySummaries.map((s) => {
              const payload = s.data as { dayKey?: string; groups?: { title: string; time?: string; items: { content: string }[] }[] };
              const groups = payload?.groups ?? [];
              const hasContent = groups.some((g) => g.items?.length > 0);
              return (
                <Link
                  key={s.workspaceId}
                  href={`/dashboard/workspaces/${s.workspaceId}`}
                  className="block min-w-[200px] max-w-[280px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 hover:border-[var(--app-navy)]/30 hover:bg-[var(--app-bg)]"
                >
                  <p className="font-medium text-[var(--app-fg)]">{s.workspaceTitle}</p>
                  {hasContent ? (
                    <ul className="mt-2 space-y-1 text-sm text-[var(--app-fg)]/80">
                      {groups.map((g) => {
                        const displayTitle =
                          g.title === "Morning Routine"
                            ? t("morningRoutine")
                            : g.title === "Night Routine"
                              ? t("nightRoutine")
                              : g.title;
                        return (
                          <li key={g.title || "g"}>
                            {displayTitle && <span className="font-medium">{displayTitle}</span>}
                            {g.items?.slice(0, 3).map((it, i) => (
                              <span key={i}> · {it.content || "—"}</span>
                            ))}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--app-fg)]/50">{t("noRoutineForToday")}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {data && (
        <div className="relative mt-6 w-full overflow-hidden">
          <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
            <motion.div
              key={`${year}-W${week}`}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.25, ease: "easeOut" },
                opacity: { duration: 0.2 },
              }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
            >
              {weekDaysInstant.map((day) => {
                const hasContent =
                  dataMatchesView && dayMap
                    ? (dayMap.get(day.dayKey)?.routines.length ?? 0) > 0 ||
                      (dayMap.get(day.dayKey)?.entries.length ?? 0) > 0
                    : false;
                const isSelected = selectedDayKey === day.dayKey;
                return (
                  <button
                    key={day.dayKey}
                    type="button"
                    onClick={() => dataMatchesView && setSelectedDayKey(day.dayKey)}
                    disabled={!dataMatchesView}
                    className={`flex flex-col items-center rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)] focus:ring-offset-2 disabled:opacity-100 disabled:cursor-default ${
                      isSelected
                        ? "border-[var(--app-navy)] bg-[var(--app-navy)]/10"
                        : day.isToday
                          ? "border-[var(--app-navy)]/70 bg-[var(--app-surface)] hover:bg-[var(--app-bg)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)]"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
                      {day.dayLabel}
                    </span>
                    <span
                      className={`mt-1 text-2xl font-semibold tabular-nums tracking-normal ${
                        day.isToday ? "text-[var(--app-navy)]" : "text-[var(--app-fg)]"
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    {hasContent && (
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--app-navy)]"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <DayDrawer
        isOpen={selectedDayKey !== null}
        onClose={() => setSelectedDayKey(null)}
        day={selectedDay}
      />
    </div>
  );
}
