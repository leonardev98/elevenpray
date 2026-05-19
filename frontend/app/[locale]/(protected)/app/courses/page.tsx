"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MOCK_COURSES } from "../lib/mock-student-data";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentCoursesPage() {
  const t = useTranslations("studentCourses");

  return (
    <StudentPageShell title={t("title")}>
      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_COURSES.map((course) => (
          <Link
            key={course.id}
            href={`/app/courses/${course.id}`}
            className="student-card block p-5 transition hover:border-[var(--app-primary)]/30"
          >
            <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-medium ${course.color}`}>
              {course.code}
            </span>
            <h3 className="mt-3 text-lg font-semibold text-[var(--app-fg)]">{course.name}</h3>
            <p className="mt-1 text-sm text-[var(--app-fg-secondary)]">{course.professor}</p>
            {course.pendingTasks > 0 && (
              <p className="mt-3 text-xs text-[var(--app-primary)]">
                {t("pendingTasks", { count: course.pendingTasks })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </StudentPageShell>
  );
}
