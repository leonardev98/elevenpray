"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getCourseAccentStyles } from "../../lib/course-styles";
import type { MockCourseExtended } from "../../lib/mock-course-data";
import { CourseProgressBar } from "./CourseProgressBar";

interface CourseCardProps {
  course: MockCourseExtended;
}

export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations("studentCourses");
  const styles = getCourseAccentStyles(course.accent);
  const hex = course.colorHex ?? null;
  const showProfessor = course.professor && course.professor !== "—";

  return (
    <Link
      href={`/app/courses/${course.id}`}
      className={cn("course-card student-card flex flex-col p-5 transition", styles.hoverBorder)}
      style={
        hex
          ? {
              borderLeftWidth: 3,
              borderLeftStyle: "solid",
              borderLeftColor: hex,
            }
          : undefined
      }
    >
      <span
        className={cn(
          "inline-block w-fit rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
          !hex && styles.badge,
        )}
        style={
          hex
            ? {
                backgroundColor: `${hex}26`,
                borderColor: hex,
                color: "var(--text-primary)",
              }
            : undefined
        }
      >
        {course.code}
      </span>
      <h3 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-[var(--text-primary)]">{course.name}</h3>
      {showProfessor ? <p className="mt-1 text-sm text-[var(--text-muted)]">{course.professor}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {course.classDays.map((day) => (
          <span key={day} className="course-day-chip">
            {day}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-1.5">
        <CourseProgressBar percent={course.progressPercent} accent={course.accent} colorHex={hex} />
        <p className="text-xs text-[var(--text-muted)]">
          {t("weeksProgress", {
            current: course.weeksCurrent,
            total: course.weeksTotal,
          })}
        </p>
      </div>
    </Link>
  );
}
