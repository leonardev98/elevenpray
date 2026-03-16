"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewWeek } from "@schedule-x/calendar";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import type { CalendarEvent } from "@schedule-x/calendar";
import type { ClassSession, Course, ScheduleConflict } from "@/app/lib/study-university/types";
import { COURSE_COLOR_CLASSES } from "@/app/lib/study-university/color-tokens";
import { cn } from "@/lib/utils";
import { parseISO } from "date-fns";

const WEEKDAY_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const ACADEMIC_TZ = "Europe/Madrid";
const CALENDAR_HEIGHT = "clamp(680px, calc(100vh - 220px), 920px)";
const CALENDAR_MIN_HEIGHT = 640;

function sessionIsInConflict(
  session: ClassSession,
  conflicts: ScheduleConflict[],
): boolean {
  const sessionDayOfWeek = parseISO(session.sessionDate).getDay();
  const sessionStart = session.startTime;
  const sessionEnd = session.endTime;
  return conflicts.some((c) => {
    const dayMatch = WEEKDAY_TO_NUMBER[c.day] === sessionDayOfWeek;
    if (!dayMatch) return false;
    const courseMatch =
      c.courseId === session.courseId ||
      c.conflictingCourseId === session.courseId;
    if (!courseMatch) return false;
    const timeOverlap =
      (sessionStart >= c.startTime &&
        sessionStart < c.conflictingEndTime) ||
      (sessionEnd > c.conflictingStartTime &&
        sessionEnd <= c.conflictingEndTime) ||
      (sessionStart <= c.startTime &&
        sessionEnd >= c.conflictingEndTime);
    return timeOverlap;
  });
}

function toZonedDateTime(dateStr: string, timeStr: string) {
  const [h, m, s] = timeStr.split(":").map(Number);
  const iso = `${dateStr}T${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:${String(s ?? 0).padStart(2, "0")}`;
  const TemporalGlobal = globalThis as unknown as {
    Temporal: {
      PlainDateTime: { from: (s: string) => { toZonedDateTime: (tz: string) => CalendarEvent["start"] } };
    };
  };
  const plain = TemporalGlobal.Temporal.PlainDateTime.from(iso);
  return plain.toZonedDateTime(ACADEMIC_TZ) as CalendarEvent["start"];
}

function UniversityTimeGridEvent({
  calendarEvent,
}: {
  calendarEvent: {
    id: string;
    title?: string;
    [key: string]: unknown;
  };
}) {
  const courseName = (calendarEvent.courseName as string) ?? calendarEvent.title ?? "Clase";
  const professor = calendarEvent.professor as string | null | undefined;
  const classroom = calendarEvent.classroom as string | null | undefined;
  const timeRange = calendarEvent.timeRange as string | undefined;
  const colorClasses = (calendarEvent.colorClasses as string[]) ?? [];
  const isConflict = Boolean(calendarEvent.isConflict);

  return (
    <div
      className={`university-sx-event ${colorClasses.join(" ")} ${isConflict ? "university-calendar-event-conflict" : ""}`}
      role="button"
      tabIndex={0}
    >
      <div className="university-calendar-event-inner">
        <div className="university-calendar-event-title">{courseName}</div>
        {professor && (
          <div className="university-calendar-event-meta">{professor}</div>
        )}
        {classroom && (
          <div className="university-calendar-event-meta">{classroom}</div>
        )}
        {timeRange && (
          <div className="university-calendar-event-time">{timeRange}</div>
        )}
      </div>
    </div>
  );
}

function extractDateFromHeaderElement(element: HTMLElement): string | null {
  const direct = element.dataset.date ?? element.getAttribute("data-date");
  if (direct && /^\d{4}-\d{2}-\d{2}$/.test(direct)) return direct;
  const dateLike = [
    element.getAttribute("aria-label"),
    element.getAttribute("data-value"),
    element.getAttribute("datetime"),
    element.getAttribute("title"),
    element.textContent,
  ].filter(Boolean) as string[];
  for (const raw of dateLike) {
    const match = raw.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return null;
}

export function UniversityWeeklyCalendar({
  courses,
  sessions,
  conflicts = [],
  onOpenSession,
  onSlotClick,
  drawerOpen = false,
}: {
  courses: Course[];
  sessions: ClassSession[];
  conflicts?: ScheduleConflict[];
  onOpenSession: (sessionId: string) => void;
  onSlotClick?: (date: string, startTime: string, endTime: string) => void;
  drawerOpen?: boolean;
}) {
  const onOpenSessionRef = useRef(onOpenSession);
  const onSlotClickRef = useRef(onSlotClick);
  const calendarRootRef = useRef<HTMLDivElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    onOpenSessionRef.current = onOpenSession;
  }, [onOpenSession]);

  useEffect(() => {
    onSlotClickRef.current = onSlotClick;
  }, [onSlotClick]);

  useEffect(() => {
    if (drawerOpen) setSelectedDate(null);
  }, [drawerOpen]);

  const courseById = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const scheduleXEvents = useMemo((): CalendarEvent[] => {
    return sessions.map((session) => {
      const course = courseById.get(session.courseId);
      const colorToken = course?.colorToken ?? "indigo";
      const colors = COURSE_COLOR_CLASSES[colorToken];
      const inConflict = sessionIsInConflict(session, conflicts);
      const start = toZonedDateTime(session.sessionDate, session.startTime);
      const end = toZonedDateTime(session.sessionDate, session.endTime);
      return {
        id: session.id,
        title: course?.name ?? session.title ?? "Clase",
        start,
        end,
        courseName: course?.name ?? session.title ?? "Clase",
        professor: course?.professor ?? null,
        classroom: session.classroom ?? course?.classroom ?? null,
        timeRange: `${session.startTime.slice(0, 5)} — ${session.endTime.slice(0, 5)}`,
        isConflict: inConflict,
        colorClasses: [
          "university-calendar-event",
          colors.soft,
          colors.border,
        ],
        _options: {
          additionalClasses: [
            "university-calendar-event",
            colors.soft,
            colors.border,
            ...(inConflict ? ["university-calendar-event-conflict"] : []),
          ],
          disableResize: true,
          disableDND: true,
        },
      };
    });
  }, [sessions, courseById, conflicts]);

  const calendar = useCalendarApp(
    {
      views: [createViewWeek()],
      defaultView: "week",
      locale: "es-ES",
      firstDayOfWeek: 1,
      dayBoundaries: { start: "06:00", end: "22:00" },
      weekOptions: { gridStep: 30 },
      events: scheduleXEvents,
      callbacks: {
        onEventClick: (event, e) => {
          e?.preventDefault?.();
          onOpenSessionRef.current(String(event.id));
        },
        onClickDateTime: (dateTime, e) => {
          e?.preventDefault?.();
          const cb = onSlotClickRef.current;
          const str = (dateTime as { toString: () => string }).toString();
          const dateStr = str.slice(0, 10);
          setSelectedDate(dateStr);
          if (!cb) return;
          const timePart = str.slice(11, 19);
          const [h, m] = timePart ? timePart.split(":").map(Number) : [0, 0];
          const startTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
          const endM = (m ?? 0) + 30;
          const endH = endM >= 60 ? (h ?? 0) + 1 : h ?? 0;
          const endMin = endM >= 60 ? endM - 60 : endM;
          const endTime = `${String(endH).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00`;
          cb(dateStr, startTime, endTime);
        },
      },
    },
    [],
  );

  useEffect(() => {
    if (!calendar) return;
    calendar.events.set(scheduleXEvents);
  }, [calendar, scheduleXEvents]);

  useEffect(() => {
    const root = calendarRootRef.current;
    if (!root) return;

    const onHeaderClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const headerCell = target.closest(".sx__week-grid__date") as HTMLElement | null;
      if (!headerCell) return;
      const extracted = extractDateFromHeaderElement(headerCell);
      if (extracted) setSelectedDate(extracted);
    };

    root.addEventListener("click", onHeaderClick);
    return () => root.removeEventListener("click", onHeaderClick);
  }, []);

  useEffect(() => {
    const root = calendarRootRef.current;
    if (!root) return;

    const headers = Array.from(
      root.querySelectorAll<HTMLElement>(".sx__week-grid__date"),
    );
    headers.forEach((header, index) => {
      header.classList.remove("sx__week-grid__date--selected-soft");
      const extracted = extractDateFromHeaderElement(header);
      if (selectedDate && extracted === selectedDate) {
        header.classList.add("sx__week-grid__date--selected-soft");
        return;
      }
      if (selectedDate && !extracted) {
        const selectedDay = Number(selectedDate.slice(8, 10));
        const dayNumberNode = header.querySelector<HTMLElement>(".sx__week-grid__date-number");
        const dayNumber = Number(dayNumberNode?.textContent?.trim() ?? NaN);
        if (!Number.isNaN(dayNumber) && dayNumber === selectedDay && index < 7) {
          header.classList.add("sx__week-grid__date--selected-soft");
        }
      }
    });
  }, [selectedDate]);

  const customComponents = useMemo(
    () => ({
      timeGridEvent: UniversityTimeGridEvent,
    }),
    [],
  );

  if (!calendar) {
    return (
      <div className="university-calendar-wrapper rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[var(--app-fg)]">
            Calendario semanal
          </h3>
        </div>
        <div
          className="flex items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]"
          style={{ height: CALENDAR_HEIGHT, minHeight: CALENDAR_MIN_HEIGHT }}
        >
          <span className="text-sm text-[var(--app-fg-muted)]">
            Cargando calendario...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "university-calendar-wrapper rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4",
        drawerOpen && "university-calendar-drawer-open",
      )}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">
          Calendario semanal
        </h3>
      </div>
      <div
        ref={calendarRootRef}
        className="university-sx-calendar-container rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]"
        style={{ height: CALENDAR_HEIGHT, minHeight: CALENDAR_MIN_HEIGHT }}
      >
        <ScheduleXCalendar
          calendarApp={calendar}
          customComponents={customComponents}
        />
      </div>
    </div>
  );
}
