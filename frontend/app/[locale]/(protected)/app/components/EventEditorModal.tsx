"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
};

const KIND_ORDER: ScheduleEventKind[] = ["class", "task", "exam", "extra"];

const KIND_CHIP_STYLES: Record<ScheduleEventKind, string> = {
  class:
    "data-[active=true]:border-violet-400/60 data-[active=true]:bg-violet-500/20 data-[active=true]:text-violet-200",
  task:
    "data-[active=true]:border-teal-400/60 data-[active=true]:bg-teal-500/20 data-[active=true]:text-teal-200",
  exam:
    "data-[active=true]:border-rose-400/60 data-[active=true]:bg-rose-500/20 data-[active=true]:text-rose-200",
  extra:
    "data-[active=true]:border-amber-400/60 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-200",
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
}

export function EventEditorModal({ state, onClose }: EventEditorModalProps) {
  const t = useTranslations("studentCalendar");
  const { events, courses, addEvent, updateEvent, removeEvent, addCourse } =
    useScheduleStore();

  const editingEvent = useMemo(
    () => (state.editingId ? events.find((e) => e.id === state.editingId) : undefined),
    [state.editingId, events],
  );

  const initialValues = useMemo(() => {
    if (editingEvent) return editingEvent;
    const d = state.defaults ?? {};
    return {
      id: "",
      kind: (d.kind ?? "class") as ScheduleEventKind,
      title: d.title ?? "",
      subtitle: d.subtitle ?? "",
      date: d.date ?? todayKey(),
      startTime: d.startTime ?? "09:00",
      endTime: d.endTime ?? addOneHour(d.startTime ?? "09:00"),
      courseId: d.courseId,
    } satisfies MockScheduleEvent;
  }, [editingEvent, state.defaults]);

  const [kind, setKind] = useState<ScheduleEventKind>(initialValues.kind);
  const [title, setTitle] = useState(initialValues.title);
  const [subtitle, setSubtitle] = useState(initialValues.subtitle ?? "");
  const [date, setDate] = useState(initialValues.date);
  const [startTime, setStartTime] = useState(initialValues.startTime.slice(0, 5));
  const [endTime, setEndTime] = useState(initialValues.endTime.slice(0, 5));
  const [courseId, setCourseId] = useState<string | undefined>(initialValues.courseId);
  const [error, setError] = useState<string | null>(null);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");

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
    setShowNewCourse(false);
    setNewCourseName("");
    setNewCourseCode("");
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
    if (editingEvent) {
      updateEvent(editingEvent.id, payload);
    } else {
      addEvent(payload);
    }
    onClose();
  }

  function handleDelete() {
    if (!editingEvent) return;
    removeEvent(editingEvent.id);
    onClose();
  }

  function handleCreateCourse() {
    if (!newCourseName.trim() || !newCourseCode.trim()) return;
    const course = addCourse({
      name: newCourseName.trim(),
      code: newCourseCode.trim().toUpperCase(),
    });
    setCourseId(course.id);
    setShowNewCourse(false);
    setNewCourseName("");
    setNewCourseCode("");
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20";

  return (
    <AnimatePresence>
      {state.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
                {editingEvent ? t("editEvent") : t("newEvent")}
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
                <div className="flex gap-2">
                  <select
                    id="event-course"
                    value={courseId ?? ""}
                    onChange={(e) => setCourseId(e.target.value || undefined)}
                    className={cn(inputClass, "flex-1")}
                  >
                    <option value="">{t("editor.courseNone")}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCourse((v) => !v)}
                    className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-xs font-medium text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]"
                  >
                    {t("editor.newCourse")}
                  </button>
                </div>
                {showNewCourse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3"
                  >
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder={t("editor.courseName")}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder={t("editor.courseCode")}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCourse}
                      disabled={!newCourseName.trim() || !newCourseCode.trim()}
                      className="w-full rounded-xl bg-[var(--app-primary)] py-2 text-xs font-semibold text-[var(--app-bg)] transition hover:bg-[var(--app-primary-hover)] disabled:opacity-50"
                    >
                      {t("editor.createCourse")}
                    </button>
                  </motion.div>
                )}
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
                <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-300">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[var(--app-border)] px-5 py-4">
              {editingEvent ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
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
                  {t("editor.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-primary-hover)]"
                >
                  {t("editor.save")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
