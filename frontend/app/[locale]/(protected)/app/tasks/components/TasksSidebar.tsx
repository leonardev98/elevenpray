"use client";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { SectionLabel } from "../../wellbeing/components/SectionLabel";
import { StreakCard } from "../../gamification/components/StreakCard";
import { COURSE_LOAD, NEXT_DUE_TASK } from "../lib/tasks-mock-data";
import { COURSE_STYLES } from "../lib/task-styles";

export function TasksSidebar() {
  return (
    <aside className="space-y-6">
      <section>
        <SectionLabel>RESUMEN</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            value="6 tareas"
            sub="total"
            icon={<ClipboardList className="h-4 w-4 text-[var(--app-fg-muted)]" />}
          />
          <StatCard
            value="2 urgentes"
            sub="hoy y mañana"
            icon={<AlertCircle className="h-4 w-4 text-[var(--error)]" />}
          />
          <StatCard
            value="40%"
            sub="en progreso"
            icon={<TrendingUp className="h-4 w-4 text-[var(--accent)]" />}
          />
          <StatCard
            value="1 completada"
            sub="esta semana"
            icon={<CheckCircle2 className="h-4 w-4 text-[var(--success)]" />}
          />
        </div>
      </section>

      <section>
        <SectionLabel>VENCE PRIMERO</SectionLabel>
        <div className="student-card border-l-4 border-l-[var(--error)] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-[var(--text-primary)]">{NEXT_DUE_TASK.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] font-medium ${COURSE_STYLES[NEXT_DUE_TASK.courseCode].badge}`}
                >
                  {NEXT_DUE_TASK.courseCode}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  mañana, miércoles 20 mayo
                </span>
              </div>
            </div>
            <AlertCircle className="h-5 w-5 shrink-0 animate-task-alert text-[var(--error)]" aria-hidden />
          </div>
          <div className="mt-3">
            <p className="mb-1 text-xs text-[var(--text-muted)]">Tiempo restante: 18 horas</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-input)]">
              <div className="h-full w-[20%] rounded-full bg-[var(--error)] transition-all" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>PROGRESO ESTA SEMANA</SectionLabel>
        <div className="student-card p-4">
          <p className="text-2xl font-semibold text-[var(--app-fg)]">1 / 6</p>
          <p className="text-xs text-[var(--app-fg-muted)]">tareas completadas</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
            <div className="h-full w-[16%] rounded-full bg-[var(--app-primary)] transition-all" />
          </div>
          <p className="mt-3 text-xs text-[var(--app-fg-muted)]">
            Cada tarea completada cuenta. Sigue así.
          </p>
        </div>
      </section>

      <section>
        <SectionLabel>RACHA DE TAREAS</SectionLabel>
        <StreakCard variant="tareas" compact />
      </section>

      <section>
        <SectionLabel>CARGA POR CURSO</SectionLabel>
        <ul className="space-y-3">
          {COURSE_LOAD.map((course) => (
            <li key={course.code}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${COURSE_STYLES[course.code].badge}`}
                  >
                    {course.code}
                  </span>
                  <span className="text-xs text-[var(--app-fg-secondary)]">{course.name}</span>
                </div>
                <span className="text-xs font-medium text-[var(--app-fg-muted)]">
                  {course.count}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                  style={{ width: `${(course.count / course.max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
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
