"use client";

import { format, parseISO } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { BookOpen, CalendarDays, CheckSquare, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useCheckIn } from "./components/check-in-context";
import { StudentPageShell } from "./components/StudentPageShell";
import { DailyXpCard } from "./gamification/components/DailyXpCard";
import { StreakCard } from "./gamification/components/StreakCard";
import { courseCodeFromCourse } from "./tasks/lib/map-assignment";
import { useHomeDashboard } from "./lib/use-home-dashboard";

export default function StudentHomePage() {
  const t = useTranslations("studentHome");
  const tNav = useTranslations("studentNav");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const { checkedInToday, openGate } = useCheckIn();
  const { classesToday, upcomingTasks, courseById, loading } = useHomeDashboard();

  return (
    <StudentPageShell title={tNav("home")}>
      <div className="space-y-6">
        <DailyXpCard />

        <div className="grid gap-4 lg:grid-cols-2">
          <StreakCard variant="estudio" staggerOnMount />
          <StreakCard variant="tareas" staggerOnMount />
        </div>

        {!checkedInToday && (
          <button
            type="button"
            onClick={openGate}
            className="student-card w-full border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] p-4 text-left transition hover:border-[var(--app-primary)]/50"
          >
            <p className="text-sm font-medium text-[var(--app-primary)]">{t("checkInReminder")}</p>
            <p className="mt-1 text-xs text-[var(--app-fg-secondary)]">{t("checkInReminderDesc")}</p>
          </button>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-fg)]">
              <CalendarDays className="h-4 w-4 text-[var(--app-primary)]" />
              {t("classesToday")}
            </h2>
            <Link href="/app/calendar" className="text-sm text-[var(--app-primary)] hover:underline">
              {t("viewCalendar")}
            </Link>
          </div>
          <div className="space-y-2">
            {loading && classesToday.length === 0 ? (
              <div className="student-card p-4 text-sm text-[var(--app-fg-muted)]">{t("loading")}</div>
            ) : classesToday.length === 0 ? (
              <div className="student-card flex flex-col items-center gap-2 p-8 text-center">
                <BookOpen className="h-8 w-8 text-[var(--app-fg-muted)]" />
                <p className="text-sm font-medium text-[var(--app-fg)]">{t("noClassesToday")}</p>
                <p className="text-xs text-[var(--app-fg-secondary)]">{t("noClassesTodayDesc")}</p>
                <Link
                  href="/app/calendar"
                  className="mt-2 text-sm font-medium text-[var(--app-primary)] hover:underline"
                >
                  {t("addInCalendar")}
                </Link>
              </div>
            ) : (
              classesToday.map((session) => {
                const course = courseById(session.courseId);
                return (
                  <Link
                    key={session.id}
                    href="/app/calendar"
                    className="student-card flex items-center gap-4 p-4 transition hover:border-[var(--app-primary)]/30"
                  >
                    <div className="min-w-[3.5rem] text-center">
                      <p className="text-sm font-semibold text-[var(--app-fg)]">{session.startTime}</p>
                      <p className="text-[10px] text-[var(--app-fg-muted)]">{session.endTime}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--app-fg)]">{session.title}</p>
                      {session.subtitle && (
                        <p className="text-sm text-[var(--app-fg-secondary)]">{session.subtitle}</p>
                      )}
                    </div>
                    {course && (
                      <span className="shrink-0 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-1 text-xs font-medium text-[var(--app-fg-secondary)]">
                        {courseCodeFromCourse(course)}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-fg)]">
              <CheckSquare className="h-4 w-4 text-[var(--app-primary)]" />
              {t("upcomingTasks")}
            </h2>
            <Link href="/app/tasks" className="text-sm text-[var(--app-primary)] hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {loading && upcomingTasks.length === 0 ? (
              <div className="student-card p-4 text-sm text-[var(--app-fg-muted)]">{t("loading")}</div>
            ) : upcomingTasks.length === 0 ? (
              <div className="student-card flex flex-col items-center gap-2 p-8 text-center">
                <CheckSquare className="h-8 w-8 text-[var(--app-fg-muted)]" />
                <p className="text-sm font-medium text-[var(--app-fg)]">{t("noTasks")}</p>
                <p className="text-xs text-[var(--app-fg-secondary)]">{t("noTasksDesc")}</p>
                <Link
                  href="/app/calendar"
                  className="mt-2 text-sm font-medium text-[var(--app-primary)] hover:underline"
                >
                  {t("addInCalendar")}
                </Link>
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const course = courseById(task.courseId);
                const isToday = task.date === format(new Date(), "yyyy-MM-dd");
                return (
                  <Link
                    key={task.id}
                    href="/app/tasks"
                    className="student-card flex items-center justify-between gap-3 p-4 transition hover:border-[var(--app-primary)]/30"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--app-fg)]">{task.title}</p>
                      <p className="text-sm text-[var(--app-fg-secondary)]">
                        {course?.name ?? task.subtitle ?? "—"} ·{" "}
                        {format(parseISO(task.date), "d MMM", { locale: dateFnsLocale })}
                        {task.startTime ? ` · ${task.startTime}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-[var(--radius-sm)] px-2.5 py-1 text-xs",
                        isToday
                          ? "bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]"
                          : "bg-[var(--app-surface-soft)] text-[var(--app-fg-secondary)]",
                      )}
                    >
                      {isToday ? t("dueToday") : t("pending")}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {classesToday.length > 0 && upcomingTasks.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-[var(--app-fg-muted)]">
            <Clock className="h-3.5 w-3.5" />
            {t("scheduleSynced")}
          </p>
        )}
      </div>
    </StudentPageShell>
  );
}
