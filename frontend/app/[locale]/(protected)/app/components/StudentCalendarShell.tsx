"use client";

import { useMemo, useState } from "react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useStudyBackendLinkStore } from "../lib/study-backend-link";
import { cn } from "@/lib/utils";
import { isLocalCalendarEventId } from "../lib/calendar-event-types";
import type { CalendarEvent } from "../lib/calendar-event-types";
import { useStudentCalendarEvents } from "../lib/use-student-calendar-events";
import { EventEditorModal, type EditorState } from "./EventEditorModal";
import { StudentScheduleCalendar } from "./StudentScheduleCalendar";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";

type ViewMode = "week" | "day";

function resolveCourseHref(serverCourseId: string, path: string, courseMap: Record<string, string>): string {
  const localId =
    Object.entries(courseMap).find(([, sid]) => sid === serverCourseId)?.[0] ?? serverCourseId;
  return path.replace(serverCourseId, localId);
}

function withLocalCourseHrefs(events: CalendarEvent[], courseMap: Record<string, string>): CalendarEvent[] {
  return events.map((e) => {
    if (!e.href || !e.courseId) return e;
    if (e.href.includes("/app/courses/")) {
      return { ...e, href: resolveCourseHref(e.courseId, e.href, courseMap) };
    }
    return e;
  });
}

function StudentCalendarShellInner() {
  const t = useTranslations("studentCalendar");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const courseMap = useStudyBackendLinkStore((s) => s.courseMap);

  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(today, { weekStartsOn: 1 }),
  );
  const [view, setView] = useState<ViewMode>("week");
  const [editorState, setEditorState] = useState<EditorState>({ open: false });

  const { events: rawEvents, courses, loading } = useStudentCalendarEvents(weekStart);
  const events = useMemo(
    () => withLocalCourseHrefs(rawEvents, courseMap),
    [rawEvents, courseMap],
  );

  const weekEnd = addDays(weekStart, 6);

  function goToToday() {
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  }

  function moveWeek(direction: -1 | 1) {
    setWeekStart((prev) => addWeeks(prev, direction));
  }

  function openSlotEditor(dateKey: string, startTime: string) {
    const [h = 9, m = 0] = startTime.split(":").map(Number);
    const totalEnd = h * 60 + m + 60;
    const eh = Math.min(Math.floor(totalEnd / 60), 23);
    const em = totalEnd % 60;
    const endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
    setEditorState({
      open: true,
      defaults: {
        date: dateKey,
        startTime,
        endTime,
        kind: "extra",
      },
    });
  }

  function openNewEditor() {
    setEditorState({
      open: true,
      defaults: {
        date: format(today, "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
        kind: "extra",
      },
    });
  }

  function openEditEditor(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    if (event.readOnly) {
      setEditorState({ open: true, readOnlyEvent: event });
      return;
    }
    if (isLocalCalendarEventId(eventId)) {
      setEditorState({ open: true, editingId: eventId });
    }
  }

  function closeEditor() {
    setEditorState({ open: false });
  }

  const rangeLabel = t("weekRange", {
    start: format(weekStart, "d MMM", { locale: dateFnsLocale }),
    end: format(weekEnd, "d MMM", { locale: dateFnsLocale }),
  });

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg-muted)]">
            {format(today, "EEEE, d MMMM", { locale: dateFnsLocale })}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--app-fg)] lg:text-4xl">
            {t("myWeek")}
          </h1>
          <p className="mt-1 text-sm capitalize text-[var(--app-fg-secondary)]">
            {rangeLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium text-[var(--app-fg)] transition hover:border-[var(--app-primary)]/40"
          >
            {t("today")}
          </button>
          <div className="flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] p-1">
            <button
              type="button"
              onClick={() => moveWeek(-1)}
              className="rounded-full p-1.5 text-[var(--app-fg-secondary)] transition hover:bg-[var(--app-surface-elevated)]"
              aria-label={t("prevWeek")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => moveWeek(1)}
              className="rounded-full p-1.5 text-[var(--app-fg-secondary)] transition hover:bg-[var(--app-surface-elevated)]"
              aria-label={t("nextWeek")}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] p-1 lg:flex">
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                view === "week"
                  ? "bg-[var(--app-primary)] text-[var(--app-bg)]"
                  : "text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]",
              )}
            >
              {t("viewWeek")}
            </button>
            <button
              type="button"
              onClick={() => setView("day")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                view === "day"
                  ? "bg-[var(--app-primary)] text-[var(--app-bg)]"
                  : "text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]",
              )}
            >
              {t("viewDay")}
            </button>
          </div>

          <button
            type="button"
            onClick={openNewEditor}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-bg)] transition hover:bg-[var(--app-primary-hover)]"
          >
            <Plus className="h-4 w-4" />
            {t("newEvent")}
          </button>
        </div>
      </header>

      {loading && events.length === 0 && (
        <p className="text-sm text-[var(--app-fg-muted)]">{t("loading")}</p>
      )}

      <div className="hidden w-full lg:block">
        {view === "week" ? (
          <WeeklyScheduleGrid
            weekStart={weekStart}
            events={events}
            onSlotClick={openSlotEditor}
            onEventClick={openEditEditor}
          />
        ) : (
          <StudentScheduleCalendar
            weekStart={weekStart}
            events={events}
            onSlotClick={openSlotEditor}
            onEventClick={openEditEditor}
          />
        )}
      </div>

      <div className="block w-full lg:hidden">
        <StudentScheduleCalendar
          weekStart={weekStart}
          events={events}
          onSlotClick={openSlotEditor}
          onEventClick={openEditEditor}
        />
      </div>

      <EventEditorModal state={editorState} onClose={closeEditor} courses={courses} />
    </div>
  );
}

export function StudentCalendarShell() {
  return <StudentCalendarShellInner />;
}
