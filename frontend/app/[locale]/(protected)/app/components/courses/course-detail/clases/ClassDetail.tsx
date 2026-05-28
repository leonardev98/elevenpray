"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/app/providers/auth-provider";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import {
  addOneHour,
  formatClassDateLine,
  formatTimeRangeDisplay,
  isValidTimeOrder,
  parseTimeRangeParts,
} from "../../../../lib/course-class-datetime";
import {
  useCourseClassesStore,
  type CourseClass,
} from "../../../../lib/course-classes-store";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import { ClassContentSection } from "./ClassContentSection";
import { ClassFilesSection } from "./ClassFilesSection";
import { ClassTaskSection } from "./ClassTaskSection";
import { ClassAiSection } from "./ClassAiSection";
import { ClassFlashcardsSection } from "./ClassFlashcardsSection";
import { ClassQuizzesSection } from "./ClassQuizzesSection";
import { PomodoroNavControl } from "../../../../pomodoro/components/PomodoroNavControl";

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
  const appLocale = useLocale();
  const { token } = useAuth();
  const { syncClassMetadata } = useStudyBackendLink(token);
  const updateClass = useCourseClassesStore((s) => s.updateClass);
  const deleteClass = useCourseClassesStore((s) => s.deleteClass);

  const initialTimes = useMemo(() => parseTimeRangeParts(cls.timeRange), [cls.timeRange]);

  const [titleDraft, setTitleDraft] = useState(cls.title);
  const [dateIso, setDateIso] = useState(cls.dateIso ?? "");
  const [startTime, setStartTime] = useState(initialTimes.start);
  const [endTime, setEndTime] = useState(initialTimes.end);
  const [unitLabel, setUnitLabel] = useState(cls.unitLabel ?? "");
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashSaved = useCallback(() => {
    setSaveStatus("saving");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => {
      setSaveStatus("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveStatus("idle"), 1500);
    }, 350);
  }, []);

  const persistAndSync = useCallback(
    (patch: Partial<Omit<CourseClass, "id" | "courseId" | "createdAt">>) => {
      updateClass(cls.id, patch);
      const next: CourseClass = { ...cls, ...patch, updatedAt: Date.now() };
      void syncClassMetadata(next);
      flashSaved();
    },
    [cls, updateClass, syncClassMetadata, flashSaved],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza drafts con la clase actual
    setTitleDraft(cls.title);
    setDateIso(cls.dateIso ?? "");
    const times = parseTimeRangeParts(cls.timeRange);
    setStartTime(times.start);
    setEndTime(times.end);
    setUnitLabel(cls.unitLabel ?? "");
    setScheduleError(null);
  }, [cls.id, cls.title, cls.dateIso, cls.timeRange, cls.unitLabel]);

  const isComplete = cls.status === "completed" || cls.completed;

  function commitTitle() {
    const next = titleDraft.trim() || `Clase ${cls.number}`;
    setTitleDraft(next);
    if (next !== cls.title) {
      persistAndSync({ title: next });
    }
  }

  function handleDateChange(iso: string) {
    setDateIso(iso);
    if (!iso) {
      if (cls.dateIso || cls.dateLine !== "Sin fecha") {
        persistAndSync({ dateIso: null, dateLine: "Sin fecha" });
      }
      return;
    }
    const dateLine = formatClassDateLine(iso, appLocale);
    if (iso !== cls.dateIso || dateLine !== cls.dateLine) {
      persistAndSync({ dateIso: iso, dateLine });
    }
  }

  function commitSchedule() {
    if (!startTime || !endTime) {
      setScheduleError("Indica hora de inicio y fin");
      return;
    }
    if (!isValidTimeOrder(startTime, endTime)) {
      setScheduleError("La hora de fin debe ser posterior a la de inicio");
      return;
    }
    setScheduleError(null);
    const next = formatTimeRangeDisplay(startTime, endTime);
    if (next !== cls.timeRange) {
      persistAndSync({ timeRange: next });
    }
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    setScheduleError(null);
    if (value && endTime && value >= endTime) {
      setEndTime(addOneHour(value));
    }
  }

  function commitUnit(value: string | null) {
    setUnitLabel(value ?? "");
    const nextUnit = value && value.trim() ? value.trim() : null;
    if (nextUnit !== cls.unitLabel) {
      persistAndSync({ unitLabel: nextUnit });
    }
    setUnitPickerOpen(false);
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
    if (dateIso) {
      parts.push(formatClassDateLine(dateIso, appLocale));
    } else if (cls.dateLine && cls.dateLine !== "Sin fecha") {
      parts.push(cls.dateLine);
    }
    if (startTime && endTime && isValidTimeOrder(startTime, endTime)) {
      parts.push(formatTimeRangeDisplay(startTime, endTime));
    } else if (cls.timeRange && cls.timeRange !== "—") {
      parts.push(cls.timeRange);
    }
    return parts.join(" · ");
  }, [dateIso, appLocale, cls.dateLine, cls.timeRange, startTime, endTime]);

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

          <PomodoroNavControl />

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
              <DatePicker
                value={dateIso}
                onChange={handleDateChange}
                placeholder="Seleccionar fecha"
                className="[&_button]:border-0 [&_button]:bg-transparent [&_button]:px-0 [&_button]:py-0 [&_button]:text-sm [&_button]:shadow-none"
              />
              {!dateIso && cls.dateLine && cls.dateLine !== "Sin fecha" ? (
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  Texto anterior: {cls.dateLine}. Elige una fecha en el calendario para fijarla.
                </p>
              ) : null}
            </Field>

            <Field icon={Clock} label="Horario">
              <div className="grid grid-cols-2 gap-2">
                <label className="sr-only" htmlFor={`class-${cls.id}-start`}>
                  Hora de inicio
                </label>
                <input
                  id={`class-${cls.id}-start`}
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  onBlur={commitSchedule}
                  className={timeInputClass}
                />
                <label className="sr-only" htmlFor={`class-${cls.id}-end`}>
                  Hora de fin
                </label>
                <input
                  id={`class-${cls.id}-end`}
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setScheduleError(null);
                  }}
                  onBlur={commitSchedule}
                  className={timeInputClass}
                />
              </div>
              {scheduleError ? (
                <p className="mt-1 text-[10px] text-[var(--error)]">{scheduleError}</p>
              ) : (
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">Inicio y fin de la sesión</p>
              )}
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

            <ClassFlashcardsSection course={course} cls={cls} hex={hex} />

            <ClassQuizzesSection course={course} cls={cls} hex={hex} />

            <ClassTaskSection course={course} cls={cls} />

            <ClassAiSection className={`Clase ${cls.number} — ${cls.title}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const timeInputClass =
  "w-full min-w-0 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/20";

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
