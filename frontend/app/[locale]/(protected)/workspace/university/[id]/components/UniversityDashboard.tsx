"use client";

import { useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { COURSE_COLOR_CLASSES } from "@/app/lib/study-university/color-tokens";
import type { Assignment, ClassSession, Course, ScheduleConflict, UniversityWorkspaceState } from "@/app/lib/study-university/types";
import { UniversityWeeklyCalendar } from "./UniversityWeeklyCalendar";

function SortableCourseCard({
  course,
  nextSession,
  attendance,
  average,
}: {
  course: Course;
  nextSession?: ClassSession;
  attendance: number;
  average: number | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const colors = COURSE_COLOR_CLASSES[course.colorToken];
  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border bg-[var(--app-surface)] p-3 ${colors.border}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colors.bg}`} />
        <p className="truncate text-sm font-semibold text-[var(--app-fg)]">{course.name}</p>
      </div>
      <p className="text-xs text-[var(--app-fg)]/60">{course.professor ?? "Sin profesor"}</p>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-[var(--app-fg)]/70">
        <span>Créditos: {course.credits ?? "-"}</span>
        <span>Asistencia: {attendance}%</span>
        <span>Promedio: {average ?? "-"}</span>
        <span>
          Próxima:{" "}
          {nextSession ? format(new Date(`${nextSession.sessionDate}T${nextSession.startTime}`), "EEE HH:mm") : "-"}
        </span>
      </div>
    </article>
  );
}

function HeroMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/50">{label}</p>
      <p className="text-xl font-semibold text-[var(--app-fg)]">{value}</p>
    </div>
  );
}

export function UniversityDashboard({
  state,
  onOpenCreateCourse,
  onOpenSession,
  onReorderCourses,
  onStartFocus,
  onUpdateAssignmentStatus,
}: {
  state: UniversityWorkspaceState;
  onOpenCreateCourse: () => void;
  onOpenSession: (sessionId: string) => void;
  onReorderCourses: (orderedCourseIds: string[]) => Promise<void>;
  onStartFocus: (durationMinutes: number, courseId?: string) => Promise<void>;
  onUpdateAssignmentStatus: (assignmentId: string, status: Assignment["status"]) => Promise<void>;
}) {
  const [courseOrder, setCourseOrder] = useState(state.courses.map((course) => course.id));
  const [focusDuration, setFocusDuration] = useState(45);

  const sensors = useSensors(useSensor(PointerSensor));
  const coursesById = useMemo(
    () => new Map(state.courses.map((course) => [course.id, course])),
    [state.courses],
  );
  const today = format(new Date(), "yyyy-MM-dd");
  const classesToday = state.sessions.filter((session) => session.sessionDate === today);
  const pendingAssignments = state.assignments
    .filter((assignment) => assignment.status !== "done" && assignment.status !== "submitted")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  async function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId || activeId === overId) return;
    const oldIndex = courseOrder.indexOf(activeId);
    const newIndex = courseOrder.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const updated = arrayMove(courseOrder, oldIndex, newIndex);
    setCourseOrder(updated);
    await onReorderCourses(updated);
  }

  const orderedCourses = courseOrder
    .map((courseId) => coursesById.get(courseId))
    .filter((course): course is Course => Boolean(course));

  return (
    <div className="space-y-4">
      <section className="grid gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 sm:grid-cols-4">
        <HeroMetric label="Cursos activos" value={state.stats.activeCourses} />
        <HeroMetric label="Créditos" value={state.stats.credits} />
        <HeroMetric label="Tareas pendientes" value={state.stats.pendingAssignments} />
        <HeroMetric label="Clases hoy" value={state.stats.classesToday} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--app-fg)]">Clases de hoy</h3>
              <Button size="sm" onClick={onOpenCreateCourse}>Crear curso</Button>
            </div>
            <div className="space-y-2">
              {classesToday.length > 0 ? (
                classesToday.map((session) => {
                  const course = coursesById.get(session.courseId);
                  return (
                    <button
                      key={session.id}
                      onClick={() => onOpenSession(session.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-left transition hover:border-[var(--app-navy)]/40"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--app-fg)]">{course?.name ?? session.title}</p>
                        <p className="text-xs text-[var(--app-fg)]/60">
                          {session.startTime} - {session.endTime} · {session.classroom ?? "Sin aula"}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--app-navy)]">Abrir entrada</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-[var(--app-fg)]/60">No hay clases hoy.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Próximas entregas</h3>
            <div className="space-y-2">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.slice(0, 6).map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-[var(--app-fg)]">{assignment.title}</p>
                      <button
                        onClick={() => onUpdateAssignmentStatus(assignment.id, "done")}
                        className="text-xs text-[var(--app-navy)] hover:underline"
                      >
                        Marcar done
                      </button>
                    </div>
                    <p className="text-xs text-[var(--app-fg)]/55">{format(new Date(assignment.deadline), "EEE dd MMM HH:mm")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--app-fg)]/60">Sin pendientes por ahora.</p>
              )}
            </div>
          </div>

          <UniversityWeeklyCalendar
            courses={state.courses}
            sessions={state.sessions}
            conflicts={state.conflicts}
            onOpenSession={onOpenSession}
            onSlotClick={onOpenCreateCourse}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Cursos</h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={courseOrder} strategy={rectSortingStrategy}>
                <div className="space-y-2">
                  {orderedCourses.map((course) => (
                    <SortableCourseCard
                      key={course.id}
                      course={course}
                      nextSession={state.sessions.find((session) => session.courseId === course.id && session.sessionDate >= today)}
                      attendance={state.attendanceByCourse[course.id] ?? 0}
                      average={state.gradeAveragesByCourse[course.id] ?? null}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Conflictos de horario</h3>
            {state.conflicts.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {state.conflicts.slice(0, 4).map((conflict, index) => (
                  <li key={`${conflict.courseId}-${index}`} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 text-rose-700 dark:text-rose-300">
                    {conflict.courseName} vs {conflict.conflictingCourseName} · {conflict.day} {conflict.startTime}-{conflict.conflictingEndTime}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--app-fg)]/60">Sin conflictos detectados.</p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
            <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Focus mode</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                step={5}
                className="w-24 rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm"
                value={focusDuration}
                onChange={(event) => setFocusDuration(Number(event.target.value))}
              />
              <Button size="sm" onClick={() => onStartFocus(focusDuration)}>Iniciar sesión</Button>
            </div>
            <p className="mt-2 text-xs text-[var(--app-fg)]/60">Minimal, rápido y orientado a ejecución.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
