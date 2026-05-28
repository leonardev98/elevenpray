"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { SectionLabel } from "../../components/SectionLabel";
import { StreakCard } from "../../gamification/components/StreakCard";
import { useStudentTasks } from "../context/student-tasks-context";
import { getCourseStyle } from "../lib/task-styles";
import { TasksSidebarEmpty } from "./TasksSidebarEmpty";
import { TasksSidebarSkeleton } from "./TasksSkeleton";

export function TasksSidebar() {
  const { tasks, loading } = useStudentTasks();

  if (!loading && tasks.length === 0) {
    return <TasksSidebarEmpty />;
  }

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status !== "done");
    const urgent = pending.filter((t) => t.section === "urgent");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const done = tasks.filter((t) => t.status === "done");
    const nextDue = [...pending].sort((a, b) => a.dueDateIso.localeCompare(b.dueDateIso))[0];
    const courseLoad = new Map<string, { code: string; name: string; count: number; colorToken: string }>();
    for (const t of pending) {
      const cur = courseLoad.get(t.courseId) ?? {
        code: t.courseCode,
        name: t.courseName,
        count: 0,
        colorToken: t.courseColorToken,
      };
      cur.count += 1;
      courseLoad.set(t.courseId, cur);
    }
    const maxCount = Math.max(1, ...[...courseLoad.values()].map((c) => c.count));
    return {
      total: tasks.length,
      urgent: urgent.length,
      inProgressPct: tasks.length ? Math.round((inProgress.length / tasks.length) * 100) : 0,
      doneWeek: done.length,
      nextDue,
      courseLoad: [...courseLoad.values()],
      maxCount,
      completedRatio: tasks.length ? done.length / tasks.length : 0,
    };
  }, [tasks]);

  if (loading) return <TasksSidebarSkeleton />;

  const hoursUntilDue = stats.nextDue
    ? Math.max(
        0,
        Math.round(
          (new Date(stats.nextDue.dueDateIso).getTime() - Date.now()) / (1000 * 60 * 60),
        ),
      )
    : 0;

  const showUrgentPulse =
    stats.nextDue &&
    stats.nextDue.section === "urgent" &&
    stats.nextDue.status !== "done";

  return (
    <aside className="space-y-6">
      <section>
        <SectionLabel>RESUMEN</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            value={`${stats.total} tareas`}
            sub="total"
            icon={<ClipboardList className="h-4 w-4 text-[var(--app-fg-muted)]" />}
          />
          <StatCard
            value={`${stats.urgent} urgentes`}
            sub="hoy y mañana"
            icon={<AlertCircle className="h-4 w-4 text-[var(--error)]" />}
          />
          <StatCard
            value={`${stats.inProgressPct}%`}
            sub="en progreso"
            icon={<TrendingUp className="h-4 w-4 text-[var(--accent)]" />}
          />
          <StatCard
            value={`${stats.doneWeek} completadas`}
            sub="en total"
            icon={<CheckCircle2 className="h-4 w-4 text-[var(--success)]" />}
          />
        </div>
      </section>

      {stats.nextDue && (
        <section>
          <SectionLabel>VENCE PRIMERO</SectionLabel>
          <div className="student-card border-l-4 border-l-[var(--error)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">{stats.nextDue.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] font-medium ${getCourseStyle(stats.nextDue.courseColorToken).badge}`}
                  >
                    {stats.nextDue.courseCode}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {stats.nextDue.dueDateLabel}
                  </span>
                </div>
              </div>
              {showUrgentPulse && (
                <AlertCircle
                  className="h-5 w-5 shrink-0 animate-task-alert text-[var(--error)]"
                  aria-hidden
                />
              )}
            </div>
            {hoursUntilDue > 0 && hoursUntilDue <= 48 && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-[var(--text-muted)]">
                  Tiempo restante: ~{hoursUntilDue} horas
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-input)]">
                  <div
                    className="h-full rounded-full bg-[var(--error)] transition-all"
                    style={{ width: `${Math.min(100, (48 - hoursUntilDue) / 48 * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <SectionLabel>PROGRESO</SectionLabel>
        <div className="student-card p-4">
          <p className="text-2xl font-semibold text-[var(--app-fg)]">
            {tasks.filter((t) => t.status === "done").length} / {stats.total || 0}
          </p>
          <p className="text-xs text-[var(--app-fg-muted)]">tareas completadas</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-500"
              style={{ width: `${stats.completedRatio * 100}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>RACHA DE TAREAS</SectionLabel>
        <StreakCard variant="tareas" compact />
      </section>

      {stats.courseLoad.length > 0 && (
        <section>
          <SectionLabel>CARGA POR CURSO</SectionLabel>
          <ul className="space-y-3">
            {stats.courseLoad.map((course) => (
              <li key={course.code}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${getCourseStyle(course.colorToken).badge}`}
                    >
                      {course.code}
                    </span>
                    <span className="text-xs text-[var(--app-fg-secondary)] truncate max-w-[120px]">
                      {course.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[var(--app-fg-muted)]">
                    {course.count}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
                  <div
                    className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                    style={{ width: `${(course.count / stats.maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

function StatCard({
  value,
  sub,
  icon,
}: {
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="student-card flex flex-col gap-1 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--app-fg)]">{value}</span>
        {icon}
      </div>
      <span className="text-[10px] text-[var(--app-fg-muted)]">{sub}</span>
    </div>
  );
}
