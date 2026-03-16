"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assignment, ClassSession, UniversityWorkspaceState } from "@/app/lib/study-university/types";
import { UniversityWeeklyCalendar } from "./UniversityWeeklyCalendar";
import { UniversityCoursesMiniWidget } from "./UniversityCoursesMiniWidget";

function HeroMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/50">{label}</p>
      <p className="mt-0.5 text-lg font-semibold leading-none text-[var(--app-fg)]">{value}</p>
    </div>
  );
}

function addMinutes(value: string, minutes: number) {
  const [hour, minute] = value.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(wrapped / 60);
  const nextMinute = wrapped % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}:00`;
}

export function UniversityDashboard({
  state,
  onOpenCreateCourse,
  onOpenSession,
  onReorderCourses: _onReorderCourses,
  onStartFocus,
  onUpdateAssignmentStatus,
  createCourseOpen = false,
}: {
  state: UniversityWorkspaceState;
  onOpenCreateCourse: (slot?: { date: string; startTime: string; endTime: string }) => void;
  onOpenSession: (sessionId: string) => void;
  onReorderCourses: (orderedCourseIds: string[]) => Promise<void>;
  onStartFocus: (durationMinutes: number, courseId?: string) => Promise<void>;
  onUpdateAssignmentStatus: (assignmentId: string, status: Assignment["status"]) => Promise<void>;
  createCourseOpen?: boolean;
}) {
  void _onReorderCourses;
  const [focusDuration, setFocusDuration] = useState(45);
  const t = useTranslations("university");
  const tDays = useTranslations("days.long");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;

  const coursesById = useMemo(
    () => new Map(state.courses.map((course) => [course.id, course])),
    [state.courses],
  );
  const today = format(new Date(), "yyyy-MM-dd");
  const classesToday = state.sessions
    .filter((session) => session.sessionDate === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pendingAssignments = state.assignments
    .filter((assignment) => assignment.status !== "done" && assignment.status !== "submitted")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const pendingByCourse = useMemo(() => {
    const result: Record<string, number> = {};
    pendingAssignments.forEach((assignment) => {
      result[assignment.courseId] = (result[assignment.courseId] ?? 0) + 1;
    });
    return result;
  }, [pendingAssignments]);
  const nextSessionByCourse = useMemo(() => {
    const sorted = [...state.sessions].sort((a, b) =>
      `${a.sessionDate}T${a.startTime}`.localeCompare(`${b.sessionDate}T${b.startTime}`),
    );
    const result = new Map<string, ClassSession>();
    sorted.forEach((session) => {
      if (session.sessionDate < today) return;
      if (!result.has(session.courseId)) result.set(session.courseId, session);
    });
    return result;
  }, [state.sessions, today]);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 shadow-app-card sm:grid-cols-4">
        <HeroMetric label={t("activeCourses")} value={state.stats.activeCourses} />
        <HeroMetric label={t("credits")} value={state.stats.credits} />
        <HeroMetric label={t("pendingTasks")} value={state.stats.pendingAssignments} />
        <HeroMetric label={t("classesToday")} value={state.stats.classesToday} />
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <UniversityWeeklyCalendar
            courses={state.courses}
            sessions={state.sessions}
            conflicts={state.conflicts}
            onOpenSession={onOpenSession}
            onSlotClick={(date, startTime, endTime) =>
              onOpenCreateCourse({ date, startTime, endTime })
            }
            drawerOpen={createCourseOpen}
          />
        </div>

        <aside className="col-span-12 space-y-3 xl:col-span-4">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-app-card">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--app-fg)]">{t("classesTodaySection")}</h3>
              <Button size="sm" onClick={() => onOpenCreateCourse()}>{t("createCourse")}</Button>
            </div>
            <div className="space-y-1.5">
              {classesToday.length > 0 ? (
                classesToday.map((session) => {
                  const course = coursesById.get(session.courseId);
                  return (
                    <button
                      key={session.id}
                      onClick={() => onOpenSession(session.id)}
                      className="flex w-full items-start justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-2 text-left transition hover:border-[var(--app-navy)]/40"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[var(--app-fg)]">{session.startTime} · {course?.name ?? session.title}</p>
                        <p className="text-xs text-[var(--app-fg)]/55">{session.classroom ?? t("noClassroom")}</p>
                      </div>
                      <span className="text-[11px] text-[var(--app-navy)]">{t("open")}</span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-md border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-3 text-xs text-[var(--app-fg)]/60">
                  {t("noClassesScheduled")}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-app-card">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">{t("upcomingDeliveries")}</h3>
            <div className="space-y-1.5">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.slice(0, 5).map((assignment) => {
                  const course = coursesById.get(assignment.courseId);
                  return (
                    <div key={assignment.id} className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-[var(--app-fg)]/65">{course?.name ?? t("course")}</p>
                          <p className="text-xs font-medium text-[var(--app-fg)]">{assignment.title}</p>
                          <p className="text-[11px] text-[var(--app-fg)]/55">
                            {formatDistanceToNowStrict(new Date(assignment.deadline), { addSuffix: true, locale: dateFnsLocale })}
                          </p>
                        </div>
                        <button
                          onClick={() => onUpdateAssignmentStatus(assignment.id, "done")}
                          className="text-[11px] text-[var(--app-navy)] hover:underline"
                        >
                          {t("done")}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-md border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-3 text-xs text-[var(--app-fg)]/60">
                  {t("noPendingDeliveries")}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-app-card">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">{t("scheduleConflicts")}</h3>
            {state.conflicts.length > 0 ? (
              <div className="space-y-2">
                {state.conflicts.slice(0, 4).map((conflict, index) => (
                  <article
                    key={`${conflict.courseId}-${index}`}
                    className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-amber-700 dark:text-amber-300"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{t("conflictDetected")}</p>
                        <p className="mt-0.5 text-[11px]">
                          {conflict.courseName}
                          {" · "}
                          {tDays(conflict.day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday") ?? conflict.day}
                          {" "}
                          {conflict.startTime} — {conflict.endTime}
                        </p>
                        <p className="text-[11px]">
                          {t("conflictsWith")} {conflict.conflictingCourseName} ({conflict.conflictingStartTime} — {conflict.conflictingEndTime})
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 border-amber-500/40 bg-transparent text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                          onClick={() =>
                            onOpenCreateCourse({
                              date: today,
                              startTime: conflict.conflictingEndTime,
                              endTime: addMinutes(conflict.conflictingEndTime, 90),
                            })
                          }
                        >
                          {t("adjustTime")}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--app-fg)]/60">{t("noConflicts")}</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-app-card">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">{t("focusMode")}</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                step={5}
                className="w-24 rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm"
                value={focusDuration}
                onChange={(event) => setFocusDuration(Number(event.target.value))}
              />
              <Button size="sm" onClick={() => onStartFocus(focusDuration)}>{t("startSession")}</Button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--app-fg)]/60">{t("focusShortDescription")}</p>
          </div>

          <UniversityCoursesMiniWidget
            courses={state.courses}
            pendingByCourse={pendingByCourse}
            nextSessionByCourse={nextSessionByCourse}
            onOpenSession={onOpenSession}
          />
        </aside>
      </section>
    </div>
  );
}
