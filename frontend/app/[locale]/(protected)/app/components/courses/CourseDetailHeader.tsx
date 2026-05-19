"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseAccentStyles } from "../../lib/course-styles";
import type { MockCourseExtended } from "../../lib/mock-course-data";
import { CourseProgressBar } from "./CourseProgressBar";

interface CourseDetailHeaderProps {
  course: MockCourseExtended;
}

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const t = useTranslations("studentCourses");
  const styles = getCourseAccentStyles(course.accent);

  return (
    <header className="mb-8">
      <Link
        href="/app/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--app-fg-secondary)] transition hover:text-[var(--app-fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-[var(--app-fg)] lg:text-3xl">
              {course.name}
            </h1>
            <span
              className={cn(
                "inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
                styles.badge,
              )}
            >
              {course.code}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--app-fg-secondary)]">{course.professor}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {course.classDays.map((day) => (
              <span key={day} className="course-day-chip">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-5 max-w-xl space-y-1.5">
            <CourseProgressBar percent={course.progressPercent} accent={course.accent} />
            <p className="text-xs text-[var(--app-fg-muted)]">
              {t("weeksProgress", {
                current: course.weeksCurrent,
                total: course.weeksTotal,
              })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
          <span className="text-xl" aria-hidden>
            🔥
          </span>
          <div>
            <p className="text-lg font-semibold tabular-nums text-[var(--app-fg)]">
              {course.streakDays}
            </p>
            <p className="text-xs text-[var(--app-fg-muted)]">
              {t("streakDays", { count: course.streakDays })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
