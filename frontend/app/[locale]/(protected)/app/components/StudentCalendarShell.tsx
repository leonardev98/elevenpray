"use client";

import { useMemo, useState } from "react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Menu, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useScheduleStore } from "../lib/use-schedule-store";
import { EventEditorModal, type EditorState } from "./EventEditorModal";
import { StudentScheduleCalendar } from "./StudentScheduleCalendar";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { useStudentShell } from "./student-shell-context";

type ViewMode = "week" | "day";

function StudentCalendarShellInner() {
  const t = useTranslations("studentCalendar");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const { events } = useScheduleStore();
  const { openMobileMenu } = useStudentShell();

  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(today, { weekStartsOn: 1 }),
  );
  const [view, setView] = useState<ViewMode>("week");
  const [editorState, setEditorState] = useState<EditorState>({ open: false });

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
        kind: "class",
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
        kind: "class",
      },
    });
  }

  function openEditEditor(eventId: string) {
    setEditorState({ open: true, editingId: eventId });
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
      {/* Cabecera grande */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {openMobileMenu && (
            <button
              type="button"
              onClick={openMobileMenu}
              className="mt-1 rounded-xl p-2 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface)] lg:hidden"
              aria-label={t("title")}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
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

          {/* Selector vista (solo desktop) */}
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

      {/* Vistas */}
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

      {/* Mobile: siempre vista diaria */}
      <div className="block w-full lg:hidden">
        <StudentScheduleCalendar
          weekStart={weekStart}
          events={events}
          onSlotClick={openSlotEditor}
          onEventClick={openEditEditor}
        />
      </div>

      <EventEditorModal state={editorState} onClose={closeEditor} />
    </div>
  );
}

export function StudentCalendarShell() {
  return <StudentCalendarShellInner />;
}
