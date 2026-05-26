"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Play } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MOCK_CLASSES_TODAY, MOCK_COURSES, MOCK_TASKS } from "./lib/mock-student-data";
import { useCheckIn } from "./components/check-in-context";
import { StudentPageShell } from "./components/StudentPageShell";
import { DailyXpCard } from "./gamification/components/DailyXpCard";
import { StreakCard } from "./gamification/components/StreakCard";

export default function StudentHomePage() {
  const t = useTranslations("studentHome");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const router = useRouter();
  const { checkedInToday, openGate } = useCheckIn();
  const upcomingTasks = MOCK_TASKS.filter((t) => t.status !== "done").slice(0, 3);

  function handleStartStudy() {
    if (!checkedInToday) openGate();
    else router.push("/app/study");
  }

  return (
    <StudentPageShell>
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

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleStartStudy}
            className="min-h-11 rounded-xl bg-[var(--app-primary)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-primary-hover)]"
          >
            <Play className="mr-2 h-4 w-4" />
            {t("startStudy")}
          </Button>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--app-fg)]">{t("classesToday")}</h2>
            <Link href="/app/calendar" className="text-sm text-[var(--app-primary)] hover:underline">
              {t("viewCalendar")}
            </Link>
          </div>
          <div className="space-y-2">
            {MOCK_CLASSES_TODAY.map((session) => {
              const course = MOCK_COURSES.find((c) => c.id === session.courseId);
              return (
                <div key={session.id} className="student-card flex items-center gap-4 p-4">
                  <div className="text-center">
                    <p className="text-xs text-[var(--app-fg-muted)]">{session.startTime}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--app-fg)]">{session.title}</p>
                    <p className="text-sm text-[var(--app-fg-secondary)]">{session.room}</p>
                  </div>
                  {course && (
                    <span className={`rounded-lg border px-2 py-1 text-xs ${course.color}`}>
                      {course.code}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--app-fg)]">{t("upcomingTasks")}</h2>
            <Link href="/app/tasks" className="text-sm text-[var(--app-primary)] hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((task) => {
              const course = MOCK_COURSES.find((c) => c.id === task.courseId);
              return (
                <div key={task.id} className="student-card flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-[var(--app-fg)]">{task.title}</p>
                    <p className="text-sm text-[var(--app-fg-secondary)]">
                      {course?.name} ·{" "}
                      {format(new Date(task.dueDate), "d MMM", { locale: dateFnsLocale })}
                    </p>
                  </div>
                  <span className="rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-2.5 py-1 text-xs text-[var(--warning)]">
                    {t("pending")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </StudentPageShell>
  );
}
