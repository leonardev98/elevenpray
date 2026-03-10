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
    const dateStr = dayDate.toISOString().slice(0, 10);
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
  const today = new Date().toISOString().slice(0, 10);
  const [y, m, d] = data.from.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  for (let i = 0; i < DAY_KEYS.length; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    if (dayDate.toISOString().slice(0, 10) === today) return DAY_KEYS[i];
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
        if (!ac.signal.aborted) setData(res);
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

  const dayMap = data ? buildDayMap(data, dayLabels) : null;
  const todayKey = getTodayDayKey(data);
  const selectedDay = selectedDayKey && dayMap ? dayMap.get(selectedDayKey) ?? null : null;

  const isCurrentWeek =
    year === getCurrentWeek().year && week === getCurrentWeek().week;

  const routineTodaySummaries =
    data?.workspaceSummaries?.filter((s) => s.kind === "routine_today") ?? [];

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
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-fg)]/70">
            {data
              ? formatDateRange(data.from, data.to, dayLabels, monthShort)
              : "—"}
            {loading && (
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--app-gold)] border-t-transparent" aria-hidden />
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (todayKey) setSelectedDayKey(todayKey);
            }}
            className="min-h-[44px] rounded-lg border border-[var(--app-gold)] bg-[var(--app-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-gold)]/20 disabled:opacity-50"
            disabled={!todayKey}
          >
            {t("myDayToday")}
          </button>
          <button
            type="button"
            onClick={() => {
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
        <section className="mt-4" aria-label="Rutina de hoy">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
            Hoy
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
                  className="block min-w-[200px] max-w-[280px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 hover:border-[var(--app-gold)]/30 hover:bg-[var(--app-bg)]"
                >
                  <p className="font-medium text-[var(--app-fg)]">{s.workspaceTitle}</p>
                  {hasContent ? (
                    <ul className="mt-2 space-y-1 text-sm text-[var(--app-fg)]/80">
                      {groups.map((g) => (
                        <li key={g.title || "g"}>
                          {g.title && <span className="font-medium">{g.title}</span>}
                          {g.items?.slice(0, 3).map((it, i) => (
                            <span key={i}> · {it.content || "—"}</span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--app-fg)]/50">Sin rutina para hoy</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {data && dayMap && (
        <div className="mt-6 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${year}-W${week}`}
              initial={{
                x: slideDirection === 0 ? 0 : slideDirection > 0 ? "100%" : "-100%",
                opacity: slideDirection === 0 ? 1 : 0.85,
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: slideDirection === 0 ? 0 : slideDirection > 0 ? "100%" : "-100%",
                opacity: slideDirection === 0 ? 1 : 0.85,
              }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
            >
              {DAY_KEYS.map((dayKey) => {
                const dayInfo = dayMap.get(dayKey)!;
                const hasContent =
                  dayInfo.routines.length > 0 || dayInfo.entries.length > 0;
                const dayNum = dayInfo.dateStr.slice(8, 10);
                const isToday = dayKey === todayKey;
                const isSelected = selectedDayKey === dayKey;
                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => setSelectedDayKey(dayKey)}
                    className={`flex flex-col items-center rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)] focus:ring-offset-2 ${
                      isSelected
                        ? "border-[var(--app-gold)] bg-[var(--app-gold)]/10"
                        : isToday
                          ? "border-[var(--app-gold)]/70 bg-[var(--app-surface)] hover:bg-[var(--app-bg)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)]"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
                      {dayInfo.dayLabel}
                    </span>
                    <span
                      className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${
                        isToday ? "text-[var(--app-gold)]" : "text-[var(--app-fg)]"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {hasContent && (
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--app-gold)]"
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
