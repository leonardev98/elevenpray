"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import {
  useCourseClassesStore,
  type CourseClass,
} from "../../../../lib/course-classes-store";
import { ClassContentSection } from "./ClassContentSection";
import { ClassFilesSection } from "./ClassFilesSection";
import { ClassTaskSection } from "./ClassTaskSection";
import { ClassAiSection } from "./ClassAiSection";

interface ClassDetailProps {
  course: MockCourseExtended;
  cls: CourseClass;
  onClose: () => void;
}

type SaveStatus = "idle" | "saving" | "saved";

const SUGGESTED_UNITS = [
  "Unidad 1",
  "Unidad 2",
  "Unidad 3",
  "Unidad 4",
  "Repaso",
  "Examen",
];

export function ClassDetail({ course, cls, onClose }: ClassDetailProps) {
  const hex = courseHex(course);
  const updateClass = useCourseClassesStore((s) => s.updateClass);
  const deleteClass = useCourseClassesStore((s) => s.deleteClass);

  const [titleDraft, setTitleDraft] = useState(cls.title);
  const [dateText, setDateText] = useState(cls.dateLine);
  const [timeRange, setTimeRange] = useState(cls.timeRange);
  const [unitLabel, setUnitLabel] = useState(cls.unitLabel ?? "");
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza drafts con la clase actual
    setTitleDraft(cls.title);
    setDateText(cls.dateLine);
    setTimeRange(cls.timeRange);
    setUnitLabel(cls.unitLabel ?? "");
  }, [cls.id, cls.title, cls.dateLine, cls.timeRange, cls.unitLabel]);

  const isComplete = cls.status === "completed" || cls.completed;

  function flashSaved() {
    setSaveStatus("saving");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => {
      setSaveStatus("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveStatus("idle"), 1500);
    }, 350);
  }

  function commitTitle() {
    const next = titleDraft.trim() || `Clase ${cls.number}`;
    setTitleDraft(next);
    if (next !== cls.title) {
      updateClass(cls.id, { title: next });
      flashSaved();
    }
  }

  function commitDate() {
    const next = dateText.trim() || "Sin fecha";
    setDateText(next);
    if (next !== cls.dateLine) {
      updateClass(cls.id, { dateLine: next });
      flashSaved();
    }
  }

  function commitTime() {
    const next = timeRange.trim() || "—";
    setTimeRange(next);
    if (next !== cls.timeRange) {
      updateClass(cls.id, { timeRange: next });
      flashSaved();
    }
  }

  function commitUnit(value: string | null) {
    setUnitLabel(value ?? "");
    updateClass(cls.id, { unitLabel: value && value.trim() ? value.trim() : null });
    setUnitPickerOpen(false);
    flashSaved();
  }

  function toggleComplete() {
    const next = !isComplete;
    updateClass(cls.id, { completed: next, status: next ? "completed" : "draft" });
    flashSaved();
  }

  function handleDelete() {
    deleteClass(cls.id);
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const headerSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (cls.dateLine) parts.push(cls.dateLine);
    if (cls.timeRange && cls.timeRange !== "—") parts.push(cls.timeRange);
    return parts.join(" · ");
  }, [cls.dateLine, cls.timeRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[300] flex flex-col bg-[var(--bg-base)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de clase ${cls.number}`}
    >
      <header className="border-b-[0.5px] border-[var(--border)] bg-[var(--bg-base)]">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
            aria-label="Cerrar"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver
          </button>

          <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden />

          <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <SaveIndicator status={saveStatus} />
            <span className="hidden sm:inline">·</span>
            <span className="hidden truncate sm:inline">{course.name}</span>
          </div>

          <button
            type="button"
            onClick={toggleComplete}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              isComplete
                ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_20%,transparent)]"
                : "border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
            )}
            aria-pressed={isComplete}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {isComplete ? "Completada" : "Marcar como completada"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--error)]"
            aria-label="Eliminar clase"
            title="Eliminar clase"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 text-base font-semibold tabular-nums"
              style={{
                borderColor: hex,
                color: hex,
                backgroundColor: `color-mix(in srgb, ${hex} 14%, transparent)`,
              }}
            >
              {cls.number}
            </span>
            <div className="min-w-0 flex-1">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTitle();
                  }
                }}
                placeholder="Título de la clase"
                className="w-full border-0 bg-transparent text-2xl font-bold tracking-tight text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)] sm:text-3xl"
              />
              {headerSubtitle ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">{headerSubtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:grid-cols-3">
            <Field icon={Calendar} label="Fecha">
              <input
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                onBlur={commitDate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitDate();
                  }
                }}
                placeholder="Ej. Lunes 5 mayo"
                className="w-full border-0 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </Field>

            <Field icon={Clock} label="Horario">
              <input
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                onBlur={commitTime}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTime();
                  }
                }}
                placeholder="Ej. 8:00 - 10:00"
                className="w-full border-0 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </Field>

            <Field icon={GraduationCap} label="Unidad / Tema">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUnitPickerOpen((v) => !v)}
                  className="flex w-full items-center justify-between gap-1 border-0 bg-transparent text-left text-sm text-[var(--text-primary)] outline-none"
                  aria-haspopup="listbox"
                  aria-expanded={unitPickerOpen}
                >
                  <span className={cn(!unitLabel && "text-[var(--text-muted)]")}>
                    {unitLabel || "Sin asignar"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
                </button>
                {unitPickerOpen ? (
                  <div
                    role="listbox"
                    onMouseLeave={() => setUnitPickerOpen(false)}
                    className="absolute left-0 top-full z-30 mt-1 w-[200px] rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-md)]"
                  >
                    <button
                      type="button"
                      onClick={() => commitUnit(null)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
                    >
                      Sin asignar
                    </button>
                    {SUGGESTED_UNITS.map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => commitUnit(u)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
          </div>

          <div className="mt-8 space-y-8">
            <ClassContentSection
              classId={cls.id}
              contentJson={cls.contentJson}
              onChange={(json) => {
                updateClass(cls.id, { contentJson: json });
                flashSaved();
              }}
            />

            <ClassFilesSection classId={cls.id} attachments={cls.attachments} />

            <ClassTaskSection
              classId={cls.id}
              courseId={course.id}
              linkedTaskId={cls.linkedTaskId}
            />

            <ClassAiSection className={`Clase ${cls.number} — ${cls.title}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        <Icon className="h-3 w-3" aria-hidden />
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Guardando…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)]">
        <Check className="h-3 w-3" aria-hidden />
        Guardado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--text-disabled)]" aria-hidden />
      Sincronizado
    </span>
  );
}
