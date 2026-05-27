"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Paperclip,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import { buildNewClassDateFields } from "../../../../lib/course-class-datetime";
import {
  useCourseClasses,
  useCourseClassesStore,
  type CourseClass,
} from "../../../../lib/course-classes-store";
import { ClassDetail } from "../clases/ClassDetail";

interface ClasesTabProps {
  course: MockCourseExtended;
}

export function ClasesTab({ course }: ClasesTabProps) {
  const hex = courseHex(course);
  const appLocale = useLocale();
  const classes = useCourseClasses(course.id);
  const createClass = useCourseClassesStore((s) => s.createClass);
  const [openClassId, setOpenClassId] = useState<string | null>(null);

  const completed = classes.filter((c) => c.status === "completed" || c.completed).length;
  const total = classes.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const openClass = classes.find((c) => c.id === openClassId) ?? null;

  function handleCreate() {
    const dateFields = buildNewClassDateFields(course, appLocale);
    const cls = createClass(course.id, {
      title: "Nueva sesión",
      ...dateFields,
      status: "draft",
    });
    setOpenClassId(cls.id);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Clases del curso
          </h2>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {total === 0
              ? "Registra tu primera sesión"
              : `${total} ${total === 1 ? "sesión" : "sesiones"} · ${completed} completada${
                  completed === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nueva clase
        </button>
      </div>

      {classes.length === 0 ? (
        <EmptyClasses onCreate={handleCreate} hex={hex} />
      ) : (
        <ol className="relative space-y-3 pl-6 before:absolute before:left-[14px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
          {classes.map((cl) => (
            <ClassListItem
              key={cl.id}
              cls={cl}
              hex={hex}
              onOpen={() => setOpenClassId(cl.id)}
            />
          ))}
        </ol>
      )}

      {total > 0 && (
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <p className="text-[var(--text-muted)]">
              {completed} de {total} clases completadas
            </p>
            <p className="font-semibold text-[var(--text-primary)] tabular-nums">{pct}%</p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: hex }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {openClass ? (
          <ClassDetail
            key={openClass.id}
            course={course}
            cls={openClass}
            onClose={() => setOpenClassId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ClassListItem({
  cls,
  hex,
  onOpen,
}: {
  cls: CourseClass;
  hex: string;
  onOpen: () => void;
}) {
  const filesCount = cls.attachments.filter((a) => a.type === "pdf" || a.type === "other").length;
  const imagesCount = cls.attachments.filter((a) => a.type === "image").length;
  const tasksCount = cls.linkedTaskId ? 1 : 0;
  const isComplete = cls.status === "completed" || cls.completed;

  return (
    <li className="relative">
      <span
        className="absolute -left-6 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold tabular-nums"
        style={{
          borderColor: hex,
          color: hex,
          backgroundColor: `color-mix(in srgb, ${hex} 14%, var(--bg-base))`,
        }}
        aria-hidden
      >
        {cls.number}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group flex w-full items-stretch gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-colors",
          "hover:-translate-y-px hover:bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-[var(--text-primary)]">
              Clase {cls.number} <span className="text-[var(--text-muted)]">—</span> {cls.title}
            </p>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {cls.dateLine}
            </span>
            {cls.timeRange && cls.timeRange !== "—" ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {cls.timeRange}
              </span>
            ) : null}
            {cls.unitLabel ? (
              <span className="inline-flex items-center gap-1 text-[var(--text-body)]">
                <GraduationCap className="h-3 w-3" aria-hidden />
                {cls.unitLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filesCount > 0 ? (
              <Chip>
                <FileText className="h-3 w-3" aria-hidden />
                {filesCount} {filesCount === 1 ? "archivo" : "archivos"}
              </Chip>
            ) : null}
            {imagesCount > 0 ? (
              <Chip>
                <ImageIcon className="h-3 w-3" aria-hidden />
                {imagesCount} {imagesCount === 1 ? "imagen" : "imágenes"}
              </Chip>
            ) : null}
            {cls.linkedNoteTitles.length > 0 ? (
              <Chip>
                <Layers className="h-3 w-3" aria-hidden />
                {cls.linkedNoteTitles.length} {cls.linkedNoteTitles.length === 1 ? "apunte" : "apuntes"}
              </Chip>
            ) : null}
            {tasksCount > 0 ? (
              <Chip>
                <ListChecks className="h-3 w-3" aria-hidden />
                1 tarea
              </Chip>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border-[0.5px] px-2 py-0.5 text-[10px]",
                isComplete
                  ? "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                  : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
              )}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Completada
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" aria-hidden />
                  Borrador
                </>
              )}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
      {children}
    </span>
  );
}

function EmptyClasses({ onCreate, hex }: { onCreate: () => void; hex: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-6 py-16 text-center">
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${hex} 14%, transparent)`,
          color: hex,
        }}
      >
        <CalendarDays className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-[var(--text-primary)]">Aún no registras clases</p>
      <p className="mt-1 max-w-[28ch] text-xs text-[var(--text-muted)]">
        Registra cada sesión y vincula apuntes, archivos, tareas y resúmenes IA en un solo lugar.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nueva clase
      </button>
      <p className="mt-3 inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
        <Paperclip className="h-3 w-3" aria-hidden />
        Soporta PDFs, imágenes y vinculación con tareas.
      </p>
    </div>
  );
}
