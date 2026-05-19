"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { MOCK_COURSES, MOCK_TASKS } from "../lib/mock-student-data";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentTasksPage() {
  const t = useTranslations("studentTasks");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const dueSoon = MOCK_TASKS.filter((task) => task.status !== "done");

  return (
    <StudentPageShell title={t("title")}>
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--app-fg-muted)]">
          {t("dueSoon")}
        </h2>
        <div className="space-y-2">
          {dueSoon.map((task) => {
            const course = MOCK_COURSES.find((c) => c.id === task.courseId);
            return (
              <div
                key={task.id}
                className="student-card flex flex-wrap items-center justify-between gap-2 p-4"
              >
                <div>
                  <p className="font-medium text-[var(--app-fg)]">{task.title}</p>
                  <p className="text-sm text-[var(--app-fg-secondary)]">
                    {format(new Date(task.dueDate), "EEEE d MMM", { locale: dateFnsLocale })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {course && (
                    <span className={`rounded-lg border px-2 py-0.5 text-xs ${course.color}`}>
                      {course.code}
                    </span>
                  )}
                  <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs text-[var(--app-primary)]">
                    {task.status === "in_progress" ? t("inProgress") : t("pending")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </StudentPageShell>
  );
}
