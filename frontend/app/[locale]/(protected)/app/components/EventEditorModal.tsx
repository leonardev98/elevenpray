"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ExternalLink, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Course } from "@/app/lib/study-university/types";
import { courseCodeFromCourse } from "../tasks/lib/map-assignment";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "../lib/calendar-event-types";
import { isLocalCalendarEventId } from "../lib/calendar-event-types";
import {
  type MockScheduleEvent,
  type ScheduleEventKind,
} from "../lib/mock-student-data";
import { useScheduleStore } from "../lib/use-schedule-store";

type EditorDefaults = Partial<MockScheduleEvent>;

export type EditorState = {
  open: boolean;
  defaults?: EditorDefaults;
  editingId?: string;
  readOnlyEvent?: CalendarEvent;
};

const KIND_ORDER: ScheduleEventKind[] = ["class", "task", "exam", "extra"];

const KIND_CHIP_STYLES: Record<ScheduleEventKind, string> = {
  class:
    "data-[active=true]:border-[var(--course-1-fg)]/40 data-[active=true]:bg-[var(--course-1-bg)] data-[active=true]:text-[var(--course-1-fg)]",
  task:
    "data-[active=true]:border-[var(--accent)]/40 data-[active=true]:bg-[var(--accent-subtle)] data-[active=true]:text-[var(--accent)]",
  exam:
    "data-[active=true]:border-[var(--error)]/40 data-[active=true]:bg-[color-mix(in_srgb,var(--error)_14%,transparent)] data-[active=true]:text-[var(--error)]",
  extra:
    "data-[active=true]:border-[var(--course-2-fg)]/40 data-[active=true]:bg-[var(--course-2-bg)] data-[active=true]:text-[var(--course-2-fg)]",
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addOneHour(time: string): string {
  const [h = 9, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + 60;
  const nh = Math.min(Math.floor(total / 60), 23);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

interface EventEditorModalProps {
  state: EditorState;
  onClose: () => void;
  courses: Course[];
}

export function EventEditorModal({ state, onClose, courses }: EventEditorModalProps) {
  const t = useTranslations("studentCalendar");
  const { events: localEvents, addEvent, updateEvent, removeEvent } = useScheduleStore();

  const readOnlyEvent = state.readOnlyEvent;
  const editingLocal = useMemo(() => {
    if (!state.editingId || !isLocalCalendarEventId(state.editingId)) return undefined;
    return localEvents.find((e) => e.id === state.editingId);
  }, [state.editingId, localEvents]);

  const initialValues = useMemo(() => {
    if (readOnlyEvent) return readOnlyEvent;
    if (editingLocal) return editingLocal;
    const d = state.defaults ?? {};
    return {
      id: "",
      kind: (d.kind ?? "extra") as ScheduleEventKind,
      title: d.title ?? "",
      subtitle: d.subtitle ?? "",
      date: d.date ?? todayKey(),
      startTime: d.startTime ?? "09:00",
      endTime: d.endTime ?? addOneHour(d.startTime ?? "09:00"),
      courseId: d.courseId,
    } satisfies MockScheduleEvent;
  }, [readOnlyEvent, editingLocal, state.defaults]);

  const [kind, setKind] = useState<ScheduleEventKind>(initialValues.kind);
  const [title, setTitle] = useState(initialValues.title);
  const [subtitle, setSubtitle] = useState(initialValues.subtitle ?? "");
  const [date, setDate] = useState(initialValues.date);
  const [startTime, setStartTime] = useState(initialValues.startTime.slice(0, 5));
  const [endTime, setEndTime] = useState(initialValues.endTime.slice(0, 5));
  const [courseId, setCourseId] = useState<string | undefined>(initialValues.courseId);
  const [error, setError] = useState<string | null>(null);

  const isReadOnly = Boolean(readOnlyEvent);

  useEffect(() => {
    if (!state.open) return;
    setKind(initialValues.kind);
    setTitle(initialValues.title);
    setSubtitle(initialValues.subtitle ?? "");
    setDate(initialValues.date);
    setStartTime(initialValues.startTime.slice(0, 5));
    setEndTime(initialValues.endTime.slice(0, 5));
    setCourseId(initialValues.courseId);
    setError(null);
  }, [state.open, initialValues]);

  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.open, onClose]);

  function handleSave() {
    if (isReadOnly) return;
    if (!title.trim()) {
      setError(t("editor.titleError"));
      return;
    }
    if (endTime <= startTime) {
      setError(t("editor.timeError"));
      return;
    }
    const payload = {
      kind,
      title: title.trim(),
      subtitle: subtitle.trim() ? subtitle.trim() : undefined,
      date,
      startTime,
      endTime,
      courseId,
    };
    if (editingLocal) {
      updateEvent(editingLocal.id, payload);
    } else {
      addEvent(payload);
    }
    onClose();
  }

  function handleDelete() {
    if (!editingLocal || isReadOnly) return;
    removeEvent(editingLocal.id);
    onClose();
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20";

  const readOnlyHint =
    readOnlyEvent?.source === "assignment"
      ? t("editor.readOnlyTaskHint")
      : readOnlyEvent?.source === "exam"
        ? t("editor.readOnlyExamHint")
        : t("editor.readOnlyClassHint");

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-editor-title"
        >
          <button
            type="button"
            aria-label={t("editor.cancel")}
            className="absolute inset-0"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-app-modal sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4">
              <h2 id="event-editor-title" className="text-base font-semibold text-[var(--app-fg)]">
                {isReadOnly ? t("viewEvent") : editingLocal ? t("editEvent") : t("newEvent")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)]"
                aria-label={t("editor.cancel")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto px-5 py-5">
              {isReadOnly && readOnlyEvent ? (
                <>
                  <p className="text-sm text-[var(--app-fg-secondary)]">{readOnlyHint}</p>
                  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t(`eventKind.${readOnlyEvent.kind}`)}
                    </p>
                    <p className="text-base font-semibold text-[var(--app-fg)]">{readOnlyEvent.title}</p>
                    {readOnlyEvent.subtitle && (
                      <p className="text-sm text-[var(--app-fg-secondary)]">{readOnlyEvent.subtitle}</p>
                    )}
                    <p className="text-sm text-[var(--app-fg-muted)]">
                      {readOnlyEvent.date} · {readOnlyEvent.startTime} – {readOnlyEvent.endTime}
                    </p>
                  </div>
                  {readOnlyEvent.href && (
                    <Link
                      href={readOnlyEvent.href}
                      onClick={onClose}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] py-2.5 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-primary-hover)]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {readOnlyEvent.source === "assignment"
                        ? t("editor.openTask")
                        : readOnlyEvent.source === "exam"
                          ? t("editor.openExam")
                          : t("editor.openCourse")}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t("editor.kindField")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {KIND_ORDER.map((k) => (
                        <button
                          key={k}
                          type="button"
                          data-active={kind === k}
                          onClick={() => setKind(k)}
                          className={cn(
                            "rounded-full border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg-secondary)] transition hover:border-[var(--app-fg-secondary)]/50 data-[active=true]:font-semibold",
                            KIND_CHIP_STYLES[k],
                          )}
                        >
                          {t(`eventKind.${k}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="event-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t("editor.titleField")}
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("editor.titlePlaceholder")}
                      className={inputClass}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="event-course" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t("editor.courseField")}
                    </label>
                    <select
                      id="event-course"
                      value={courseId ?? ""}
                      onChange={(e) => setCourseId(e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">{t("editor.courseNone")}</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {courseCodeFromCourse(c)} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="event-date" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                        {t("editor.dateField")}
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="event-start" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                        {t("editor.startField")}
                      </label>
                      <input
                        id="event-start"
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStartTime(v);
                          if (v >= endTime) setEndTime(addOneHour(v));
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="event-end" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                        {t("editor.endField")}
                      </label>
                      <input
                        id="event-end"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="event-subtitle" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                      {t("editor.subtitleField")}
                    </label>
                    <input
                      id="event-subtitle"
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder={t("editor.subtitlePlaceholder")}
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <p className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] px-3 py-2 text-xs text-[var(--error)]">
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[var(--app-border)] px-5 py-4">
              {!isReadOnly && editingLocal ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border-[0.5px] border-[color-mix(in_srgb,var(--error)_30%,transparent)] px-3 py-2 text-xs font-medium text-[var(--error)] transition hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("editor.delete")}
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]"
                >
                  {isReadOnly ? t("editor.close") : t("editor.cancel")}
                </button>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-primary-hover)]"
                  >
                    {t("editor.save")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
