"use client";

import { COURSE_COLOR_CLASSES } from "@/app/lib/study-university/color-tokens";
import type { ClassSession, Course } from "@/app/lib/study-university/types";

export function UniversityCoursesMiniWidget({
  courses,
  pendingByCourse,
  nextSessionByCourse,
  onOpenSession,
}: {
  courses: Course[];
  pendingByCourse: Record<string, number>;
  nextSessionByCourse: Map<string, ClassSession>;
  onOpenSession: (sessionId: string) => void;
}) {
  const visibleCourses = courses.slice(0, 8);

  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
      <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Cursos</h3>
      <div className="space-y-1.5">
        {visibleCourses.length > 0 ? (
          visibleCourses.map((course) => {
            const colors = COURSE_COLOR_CLASSES[course.colorToken];
            const pendingCount = pendingByCourse[course.id] ?? 0;
            const nextSession = nextSessionByCourse.get(course.id);
            return (
              <button
                key={course.id}
                onClick={() => nextSession && onOpenSession(nextSession.id)}
                disabled={!nextSession}
                className="flex w-full items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-2 text-left transition hover:border-[var(--app-navy)]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors.bg}`} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--app-fg)]">{course.name}</p>
                    <p className="text-[11px] text-[var(--app-fg)]/55">
                      {nextSession ? `${nextSession.sessionDate} · ${nextSession.startTime}` : "Sin próxima clase"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--app-fg)]/80">
                  {pendingCount}
                </span>
              </button>
            );
          })
        ) : (
          <div className="rounded-md border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-3 text-xs text-[var(--app-fg)]/60">
            Aun no hay cursos creados.
          </div>
        )}
      </div>
    </div>
  );
}
