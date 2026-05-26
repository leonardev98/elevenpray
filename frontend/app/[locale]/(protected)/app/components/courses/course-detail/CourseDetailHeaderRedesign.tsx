"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  CircleCheck,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  MapPin,
} from "lucide-react";
import { classDayLetters, courseHex, mondayWeekIndexFromDate } from "./course-detail-utils";
import type { MockCourseExtended } from "../../../lib/mock-course-data";

interface CourseDetailHeaderRedesignProps {
  course: MockCourseExtended;
  stats: { apuntes: number; archivos: number; flashcards: number; tareasCompletadas: number };
}

const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function CourseDetailHeaderRedesign({ course, stats }: CourseDetailHeaderRedesignProps) {
  const hex = courseHex(course);
  const letters = classDayLetters(course);
  const todayIdx = mondayWeekIndexFromDate(new Date());
  /** Demo: L y M completados; hoy resaltado */
  const streakComplete = [true, true, false, false, true, false, false];

  return (
    <header className="relative mb-6 border-b-[0.5px] border-[var(--border)] pb-6">
      <div className="grid gap-4 lg:relative">
        <div className="flex justify-end lg:absolute lg:right-0 lg:top-0 lg:z-10">
          <div className="w-full max-w-[160px] rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)] sm:w-[160px]">
            <div className="flex items-start gap-2">
              <Flame className="h-5 w-5 shrink-0 text-[var(--racha)]" aria-hidden />
              <div>
                <p className="text-2xl font-semibold leading-none text-[var(--text-primary)] tabular-nums">{course.streakDays}</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">días de racha</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between gap-0.5">
              {WEEK_LABELS.map((label, i) => {
                const done = streakComplete[i] ?? false;
                const isToday = i === todayIdx;
                return (
                  <div
                    key={label}
                    title={label}
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-medium",
                      done
                        ? "bg-[var(--racha)] text-[var(--accent-fg)]"
                        : "bg-[var(--bg-input)] text-[var(--text-muted)]",
                      isToday && "ring-1 ring-dashed ring-[var(--racha)] ring-offset-1 ring-offset-[var(--bg-surface)]",
                    )}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:pr-[176px]">
        {/* Fila superior */}
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/app/courses"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver
          </Link>
        </div>

        {/* Fila título */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{course.name}</h1>
            <span
              className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-fg)] sm:ml-3"
              style={{ backgroundColor: hex }}
            >
              {course.code}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
            <MapPin className="h-3 w-3" aria-hidden />
            {course.modality ?? "Presencial"}
          </span>
        </div>

        {/* Fila info */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            <span className="text-xs">{course.professor || "—"}</span>
          </span>
          <span className="text-[var(--text-disabled)]" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            {letters.map((L, i) => (
              <span
                key={`${L}-${i}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold"
                style={{ borderColor: hex, color: hex, width: "24px", height: "24px" }}
              >
                {L}
              </span>
            ))}
          </span>
        </div>

        {/* Fila progreso */}
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            Semana {course.weeksCurrent} de {course.weeksTotal}
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${course.progressPercent}%`, backgroundColor: hex }}
            />
          </div>
          <p className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" aria-hidden />
              {stats.apuntes} apuntes
            </span>
            <span className="text-[var(--text-disabled)]">·</span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" aria-hidden />
              {stats.archivos} archivos
            </span>
            <span className="text-[var(--text-disabled)]">·</span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" aria-hidden />
              {stats.flashcards} flashcards
            </span>
            <span className="text-[var(--text-disabled)]">·</span>
            <span className="inline-flex items-center gap-1">
              <CircleCheck className="h-3 w-3" aria-hidden />
              {stats.tareasCompletadas === 1
                ? "1 tarea completada"
                : `${stats.tareasCompletadas} tareas completadas`}
            </span>
          </p>
        </div>
        </div>
      </div>
    </header>
  );
}
