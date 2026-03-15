"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { ClassSession, Course, ScheduleConflict } from "@/app/lib/study-university/types";
import { COURSE_COLOR_CLASSES } from "@/app/lib/study-university/color-tokens";
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
    const courseMatch = c.courseId === session.courseId || c.conflictingCourseId === session.courseId;
    if (!courseMatch) return false;
    const timeOverlap =
      (sessionStart >= c.startTime && sessionStart < c.conflictingEndTime) ||
      (sessionEnd > c.conflictingStartTime && sessionEnd <= c.conflictingEndTime) ||
      (sessionStart <= c.startTime && sessionEnd >= c.conflictingEndTime);
    return timeOverlap;
  });
}

export function UniversityWeeklyCalendar({
  courses,
  sessions,
  conflicts = [],
  onOpenSession,
  onSlotClick,
}: {
  courses: Course[];
  sessions: ClassSession[];
  conflicts?: ScheduleConflict[];
  onOpenSession: (sessionId: string) => void;
  onSlotClick?: (date: string, startTime: string, endTime: string) => void;
}) {
  const courseById = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  const events = useMemo(
    () =>
      sessions.map((session) => {
        const course = courseById.get(session.courseId);
        const colorToken = course?.colorToken ?? "indigo";
        const colors = COURSE_COLOR_CLASSES[colorToken];
        const inConflict = sessionIsInConflict(session, conflicts);
        return {
          id: session.id,
          title: course?.name ?? session.title ?? "Clase",
          start: `${session.sessionDate}T${session.startTime}`,
          end: `${session.sessionDate}T${session.endTime}`,
          backgroundColor: "transparent",
          borderColor: "transparent",
          classNames: [
            "university-calendar-event",
            colors.soft,
            colors.border,
            inConflict ? "university-calendar-event-conflict" : "",
          ].filter(Boolean),
          extendedProps: {
            courseName: course?.name ?? session.title ?? "Clase",
            professor: course?.professor ?? null,
            classroom: session.classroom ?? course?.classroom ?? null,
          },
        };
      }),
    [sessions, courseById, conflicts],
  );

  const handleDateClick = (arg: { dateStr: string; allDay: boolean }) => {
    if (arg.allDay || !onSlotClick) return;
    const d = arg.dateStr; // ISO date or datetime
    const dateOnly = d.slice(0, 10);
    const timePart = d.slice(11, 19); // HH:mm:ss
    if (!timePart) return;
    const [h, m] = timePart.split(":").map(Number);
    const endM = m + 30;
    const endH = endM >= 60 ? h + 1 : h;
    const endMin = endM >= 60 ? endM - 60 : endM;
    const startTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00`;
    onSlotClick(dateOnly, startTime, endTime);
  };

  return (
    <div className="university-calendar-wrapper rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">
          Calendario semanal
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          allDaySlot={false}
          slotDuration="00:30:00"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          height={520}
          locale="es"
          firstDay={1}
          events={events}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            onOpenSession(info.event.id);
          }}
          dateClick={handleDateClick}
          eventContent={(arg) => {
            const { courseName, professor, classroom } = arg.event.extendedProps as {
              courseName: string;
              professor: string | null;
              classroom: string | null;
            };
            const lines = [courseName];
            if (professor) lines.push(professor);
            if (classroom) lines.push(classroom);
            return {
              html: `<div class="university-calendar-event-inner"><div class="university-calendar-event-title">${escapeHtml(courseName)}</div>${professor ? `<div class="university-calendar-event-meta">${escapeHtml(professor)}</div>` : ""}${classroom ? `<div class="university-calendar-event-meta">${escapeHtml(classroom)}</div>` : ""}</div>`,
            };
          }}
        />
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
