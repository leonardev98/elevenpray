"use client";

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, addWeeks, endOfWeek, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { COURSE_COLOR_CLASSES } from "@/app/lib/study-university/color-tokens";
import type { ClassSession, Course, ScheduleConflict } from "@/app/lib/study-university/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAY_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const CALENDAR_HEIGHT = "clamp(680px, calc(100vh - 220px), 920px)";
const CALENDAR_MIN_HEIGHT = 640;
const DAY_START_MINUTES = 6 * 60;
const DAY_END_MINUTES = 22 * 60;
const SLOT_MINUTES = 30;
const SNAP_MINUTES = 30;
const MIN_EVENT_DURATION_MINUTES = 30;
const PIXELS_PER_MINUTE = 1.85;
const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
const GRID_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE;
const TIME_AXIS_WIDTH = 56;
const GRID_COLS = `${TIME_AXIS_WIDTH}px repeat(7, 1fr)`;

type SessionDraft = {
  sessionDate: string;
  startTime: string;
  endTime: string;
};

type InteractionState =
  | {
      mode: "drag";
      pointerId: number;
      sessionId: string;
      offsetMinutes: number;
      durationMinutes: number;
    }
  | {
      mode: "resize-bottom";
      pointerId: number;
      sessionId: string;
      startMinutes: number;
    };

type VisualSession = {
  session: ClassSession;
  sessionDate: string;
  startMinutes: number;
  endMinutes: number;
};

function sessionIsInConflict(session: ClassSession, conflicts: ScheduleConflict[]): boolean {
  const sessionDayOfWeek = parseISO(session.sessionDate).getDay();
  return conflicts.some((conflict) => {
    const dayMatch = WEEKDAY_TO_NUMBER[conflict.day] === sessionDayOfWeek;
    if (!dayMatch) return false;
    const courseMatch =
      conflict.courseId === session.courseId ||
      conflict.conflictingCourseId === session.courseId;
    if (!courseMatch) return false;
    return (
      (session.startTime >= conflict.startTime && session.startTime < conflict.conflictingEndTime) ||
      (session.endTime > conflict.conflictingStartTime && session.endTime <= conflict.conflictingEndTime) ||
      (session.startTime <= conflict.startTime && session.endTime >= conflict.conflictingEndTime)
    );
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, step: number, mode: "round" | "floor" = "round") {
  if (mode === "floor") return Math.floor(value / step) * step;
  return Math.round(value / step) * step;
}

function timeToMinutes(value: string): number {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTimeString(value: number): string {
  const safe = clamp(Math.floor(value), 0, 23 * 60 + 59);
  const hour = Math.floor(safe / 60);
  const minute = safe % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

export function UniversityWeeklyCalendar({
  courses,
  sessions,
  conflicts = [],
  onOpenSession,
  onSlotClick,
  onUpdateSessionTime,
  drawerOpen = false,
}: {
  courses: Course[];
  sessions: ClassSession[];
  conflicts?: ScheduleConflict[];
  onOpenSession: (sessionId: string) => void;
  onSlotClick?: (date: string, startTime: string, endTime: string) => void;
  onUpdateSessionTime?: (
    sessionId: string,
    payload: { sessionDate?: string; startTime?: string; endTime?: string; classroom?: string },
  ) => Promise<void> | void;
  drawerOpen?: boolean;
}) {
  const t = useTranslations("university");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;

  const [visibleWeekStart, setVisibleWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(() => format(new Date(), "yyyy-MM-dd"));
  const [interaction, setInteraction] = useState<InteractionState | null>(null);
  const [sessionDrafts, setSessionDrafts] = useState<Record<string, SessionDraft>>({});
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const dayColumnsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (drawerOpen) setSelectedDate(null);
  }, [drawerOpen]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const sessionById = useMemo(() => new Map(sessions.map((session) => [session.id, session])), [sessions]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(visibleWeekStart, index);
      return {
        date,
        key: format(date, "yyyy-MM-dd"),
        dayLabel: format(date, "EEE", { locale: dateLocale }).toUpperCase(),
        dayNumber: format(date, "d"),
      };
    });
  }, [dateLocale, visibleWeekStart]);

  const weekDateSet = useMemo(() => new Set(weekDays.map((day) => day.key)), [weekDays]);

  const visibleSessions = useMemo(() => {
    return sessions
      .map((session): VisualSession | null => {
        const draft = sessionDrafts[session.id];
        const sessionDate = draft?.sessionDate ?? session.sessionDate;
        if (!weekDateSet.has(sessionDate)) return null;
        const startMinutes = timeToMinutes(draft?.startTime ?? session.startTime);
        const endMinutes = timeToMinutes(draft?.endTime ?? session.endTime);
        if (endMinutes <= startMinutes) return null;
        return { session, sessionDate, startMinutes, endMinutes };
      })
      .filter((entry): entry is VisualSession => Boolean(entry))
      .sort((a, b) =>
        a.sessionDate === b.sessionDate ? a.startMinutes - b.startMinutes : a.sessionDate.localeCompare(b.sessionDate),
      );
  }, [sessions, sessionDrafts, weekDateSet]);

  const sessionsByDate = useMemo(() => {
    const grouped = new Map<string, VisualSession[]>();
    weekDays.forEach((day) => grouped.set(day.key, []));
    visibleSessions.forEach((entry) => grouped.get(entry.sessionDate)?.push(entry));
    return grouped;
  }, [visibleSessions, weekDays]);

  const weekRangeLabel = useMemo(() => {
    const weekEnd = endOfWeek(visibleWeekStart, { weekStartsOn: 1 });
    return `${format(visibleWeekStart, "d MMM", { locale: dateLocale })} - ${format(weekEnd, "d MMM", { locale: dateLocale })}`;
  }, [dateLocale, visibleWeekStart]);

  const timeMarkers = useMemo(() => {
    const markers: Array<{ minute: number; label: string }> = [];
    for (let minute = DAY_START_MINUTES; minute <= DAY_END_MINUTES; minute += 60) {
      markers.push({ minute, label: `${String(Math.floor(minute / 60)).padStart(2, "0")}:00` });
    }
    return markers;
  }, []);

  const slotMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let minute = DAY_START_MINUTES; minute <= DAY_END_MINUTES; minute += SLOT_MINUTES) markers.push(minute);
    return markers;
  }, []);

  function getPointerPosition(clientX: number, clientY: number) {
    const container = bodyScrollRef.current;
    const gridEl = dayColumnsRef.current;
    if (!container || !gridEl) return null;
    const rect = gridEl.getBoundingClientRect();
    const gridWidth = gridEl.scrollWidth || rect.width;
    if (gridWidth <= 0) return null;
    const daysAreaWidth = gridWidth - TIME_AXIS_WIDTH;
    const x = clientX - rect.left + container.scrollLeft - TIME_AXIS_WIDTH;
    const y = clientY - rect.top + container.scrollTop;
    const dayIndex = clamp(Math.floor(x / (daysAreaWidth / 7)), 0, 6);
    const minutes = DAY_START_MINUTES + clamp(y / PIXELS_PER_MINUTE, 0, TOTAL_MINUTES);
    return { dayIndex, minutes };
  }

  function updateDraft(sessionId: string, draft: SessionDraft) {
    setSessionDrafts((prev) => {
      const current = prev[sessionId];
      if (
        current?.sessionDate === draft.sessionDate &&
        current?.startTime === draft.startTime &&
        current?.endTime === draft.endTime
      ) {
        return prev;
      }
      return { ...prev, [sessionId]: draft };
    });
  }

  async function commitInteraction(sessionId: string) {
    const draft = sessionDrafts[sessionId];
    const originalSession = sessionById.get(sessionId);
    if (!draft || !originalSession) return;

    const changed =
      draft.sessionDate !== originalSession.sessionDate ||
      draft.startTime !== originalSession.startTime ||
      draft.endTime !== originalSession.endTime;

    if (!changed || !onUpdateSessionTime) {
      setSessionDrafts((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      return;
    }

    setUpdatingSessionId(sessionId);
    try {
      await onUpdateSessionTime(sessionId, {
        sessionDate: draft.sessionDate,
        startTime: draft.startTime,
        endTime: draft.endTime,
        classroom: originalSession.classroom ?? undefined,
      });
    } catch (error) {
      console.error("Unable to update session", error);
    } finally {
      setSessionDrafts((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      setUpdatingSessionId(null);
    }
  }

  useEffect(() => {
    if (!interaction) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== interaction.pointerId) return;
      const pointer = getPointerPosition(event.clientX, event.clientY);
      if (!pointer) return;
      const day = weekDays[pointer.dayIndex];
      if (!day) return;

      if (interaction.mode === "drag") {
        const nextStart = roundToStep(pointer.minutes - interaction.offsetMinutes, SNAP_MINUTES);
        const start = clamp(nextStart, DAY_START_MINUTES, DAY_END_MINUTES - interaction.durationMinutes);
        const end = start + interaction.durationMinutes;
        updateDraft(interaction.sessionId, {
          sessionDate: day.key,
          startTime: minutesToTimeString(start),
          endTime: minutesToTimeString(end),
        });
        setSelectedDate(day.key);
      } else {
        const nextEnd = roundToStep(pointer.minutes, SNAP_MINUTES);
        const end = clamp(nextEnd, interaction.startMinutes + MIN_EVENT_DURATION_MINUTES, DAY_END_MINUTES);
        const existing = sessionDrafts[interaction.sessionId] ?? sessionById.get(interaction.sessionId);
        if (!existing) return;
        updateDraft(interaction.sessionId, {
          sessionDate: existing.sessionDate,
          startTime: existing.startTime,
          endTime: minutesToTimeString(end),
        });
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== interaction.pointerId) return;
      const sessionId = interaction.sessionId;
      setInteraction(null);
      void commitInteraction(sessionId);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [interaction, onUpdateSessionTime, sessionById, sessionDrafts, weekDays]);

  const goToToday = () => {
    const today = new Date();
    setVisibleWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(format(today, "yyyy-MM-dd"));
  };

  const moveWeek = (direction: -1 | 1) => setVisibleWeekStart((prev) => addWeeks(prev, direction));

  const handleDateSelection = (dateValue: string) => {
    if (!dateValue) return;
    const date = parseISO(dateValue);
    if (Number.isNaN(date.getTime())) return;
    setVisibleWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    setSelectedDate(format(date, "yyyy-MM-dd"));
  };

  const handleDaySlotClick = (dayKey: string, event: ReactMouseEvent<HTMLDivElement>) => {
    if (!onSlotClick) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const minutes = DAY_START_MINUTES + clamp(y / PIXELS_PER_MINUTE, 0, TOTAL_MINUTES);
    const start = roundToStep(minutes, SLOT_MINUTES, "floor");
    const end = clamp(start + SLOT_MINUTES, DAY_START_MINUTES, DAY_END_MINUTES);
    if (end <= start) return;
    setSelectedDate(dayKey);
    onSlotClick(dayKey, minutesToTimeString(start), minutesToTimeString(end));
  };

  const startDraggingSession = (event: ReactPointerEvent<HTMLButtonElement>, entry: VisualSession) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const pointer = getPointerPosition(event.clientX, event.clientY);
    if (!pointer) return;
    const durationMinutes = entry.endMinutes - entry.startMinutes;
    if (durationMinutes <= 0) return;
    setInteraction({
      mode: "drag",
      pointerId: event.pointerId,
      sessionId: entry.session.id,
      offsetMinutes: pointer.minutes - entry.startMinutes,
      durationMinutes,
    });
  };

  const startResizingBottom = (event: ReactPointerEvent<HTMLDivElement>, entry: VisualSession) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setInteraction({
      mode: "resize-bottom",
      pointerId: event.pointerId,
      sessionId: entry.session.id,
      startMinutes: entry.startMinutes,
    });
  };

  const today = new Date();

  return (
    <div
      className={cn(
        "university-calendar-wrapper rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4",
        drawerOpen && "university-calendar-drawer-open",
      )}
      style={{ position: "relative", zIndex: 0, isolation: "isolate" }}
    >
      {/* Title */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">{t("weeklyCalendar")}</h3>
      </div>

      {/* Surface */}
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]" style={{ padding: 10 }}>
        {/* Toolbar */}
        <div
          className="ucal-toolbar"
          style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 8, marginBottom: 12 }}
        >
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={goToToday}>
              {t("today")}
            </Button>
            <Button size="icon" variant="outline" aria-label={t("prevWeek")} onClick={() => moveWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" aria-label={t("nextWeek")} onClick={() => moveWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm font-medium text-[var(--app-fg)]" style={{ textAlign: "center" }}>
            {weekRangeLabel}
          </p>

          <input
            type="date"
            className="ucal-date-input"
            aria-label={t("goToDate")}
            value={selectedDate ?? ""}
            onChange={(event) => handleDateSelection(event.target.value)}
          />
        </div>

        {/* Grid shell */}
        <div className="ucal-grid-shell" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--app-border)" }}>
          {/* Header row: axis spacer + 7 day columns */}
          <div
            className="ucal-header-row"
            style={{
              display: "grid",
              gridTemplateColumns: GRID_COLS,
              borderBottom: "1px solid var(--app-border)",
              background: "var(--app-surface)",
            }}
          >
            {/* Axis spacer */}
            <div style={{ width: TIME_AXIS_WIDTH, borderRight: "1px solid var(--app-border)" }} />
            {/* Day headers */}
            {weekDays.map((day) => {
              const isToday = isSameDay(day.date, today);
              const isSelected = selectedDate === day.key;
              return (
                <button
                  key={day.key}
                  type="button"
                  role="columnheader"
                  onClick={() => setSelectedDate(day.key)}
                  className={cn("ucal-day-header", isToday && "is-today", isSelected && "is-selected")}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    padding: "8px 4px",
                    background: "transparent",
                    border: "none",
                    borderLeft: "1px solid var(--app-border)",
                    cursor: "pointer",
                  }}
                >
                  <span className="ucal-day-label" style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: isToday ? "var(--app-primary)" : "var(--app-fg-muted)" }}>
                    {day.dayLabel}
                  </span>
                  <span
                    className="ucal-day-number"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: isToday ? "var(--app-primary)" : "var(--app-fg)",
                      padding: "0 4px",
                      borderRadius: 4,
                      ...(isToday ? { background: "var(--app-primary-soft)" } : {}),
                      ...(isSelected ? { boxShadow: "inset 0 -2px 0 var(--app-primary)" } : {}),
                    }}
                  >
                    {day.dayNumber}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scrollable body */}
          <div
            ref={bodyScrollRef}
            className="ucal-grid-body"
            style={{
              overflow: "auto",
              height: CALENDAR_HEIGHT,
              minHeight: CALENDAR_MIN_HEIGHT,
              background: "var(--app-bg)",
            }}
          >
            {/* Grid content: time axis + 7 day columns */}
            <div
              ref={dayColumnsRef}
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLS,
                height: GRID_HEIGHT,
                position: "relative",
              }}
              role="grid"
              aria-label={t("weeklyCalendar")}
            >
              {/* Time axis */}
              <div style={{ position: "relative", borderRight: "1px solid var(--app-border)", width: TIME_AXIS_WIDTH }}>
                {timeMarkers.map((marker) => (
                  <span
                    key={marker.minute}
                    style={{
                      position: "absolute",
                      top: (marker.minute - DAY_START_MINUTES) * PIXELS_PER_MINUTE,
                      right: 8,
                      transform: "translateY(-50%)",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      color: "var(--app-fg-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {marker.label}
                  </span>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const daySessions = sessionsByDate.get(day.key) ?? [];
                const isSelected = selectedDate === day.key;
                return (
                  <div
                    key={day.key}
                    role="gridcell"
                    onClick={(event) => handleDaySlotClick(day.key, event)}
                    style={{
                      position: "relative",
                      height: GRID_HEIGHT,
                      borderLeft: "1px solid var(--app-border)",
                    }}
                  >
                    {/* Selected day background overlay */}
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "var(--app-primary-soft)",
                          opacity: 0.3,
                          pointerEvents: "none",
                          zIndex: 0,
                        }}
                      />
                    )}

                    {/* Slot lines */}
                    {slotMarkers.map((minute) => (
                      <div
                        key={`${day.key}-${minute}`}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: (minute - DAY_START_MINUTES) * PIXELS_PER_MINUTE,
                          borderTop: minute % 60 === 0
                            ? "1px solid var(--app-border)"
                            : "1px dashed color-mix(in oklab, var(--app-border) 50%, transparent 50%)",
                          pointerEvents: "none",
                          zIndex: 0,
                        }}
                      />
                    ))}

                    {/* Events */}
                    {daySessions.map((entry) => {
                      const course = courseById.get(entry.session.courseId);
                      const colorToken = course?.colorToken ?? "indigo";
                      const colorClasses = COURSE_COLOR_CLASSES[colorToken];
                      const inConflict = sessionIsInConflict(entry.session, conflicts);
                      const start = clamp(entry.startMinutes, DAY_START_MINUTES, DAY_END_MINUTES);
                      const end = clamp(entry.endMinutes, DAY_START_MINUTES, DAY_END_MINUTES);
                      if (end <= start) return null;
                      const evTop = (start - DAY_START_MINUTES) * PIXELS_PER_MINUTE;
                      const evHeight = Math.max((end - start) * PIXELS_PER_MINUTE, 34);
                      const courseName = course?.name ?? entry.session.title ?? t("course");
                      const classroom = entry.session.classroom ?? course?.classroom;
                      const timeRange = `${entry.session.startTime.slice(0, 5)} - ${entry.session.endTime.slice(0, 5)}`;

                      return (
                        <button
                          key={entry.session.id}
                          type="button"
                          data-session-event="true"
                          tabIndex={0}
                          aria-label={`${courseName}. ${timeRange}`}
                          className={cn(
                            "ucal-event",
                            colorClasses.soft,
                            colorClasses.border,
                            inConflict && "ucal-event-conflict",
                            updatingSessionId === entry.session.id && "opacity-70",
                          )}
                          style={{
                            position: "absolute",
                            top: evTop,
                            height: evHeight,
                            left: 4,
                            right: 4,
                            zIndex: 1,
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderLeftWidth: 4,
                            borderRadius: 8,
                            padding: 0,
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenSession(entry.session.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onOpenSession(entry.session.id);
                            }
                          }}
                          onPointerDown={(event) => startDraggingSession(event, entry)}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              padding: "6px 8px 2px",
                              overflow: "hidden",
                              height: "calc(100% - 10px)",
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--app-fg)" }}>
                              {courseName}
                            </span>
                            {classroom && (
                              <span style={{ fontSize: "0.68rem", color: "var(--app-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {classroom}
                              </span>
                            )}
                            <span style={{ fontSize: "0.68rem", color: "var(--app-fg-muted)", opacity: 0.8 }}>
                              {timeRange}
                            </span>
                          </div>
                          {/* Resize handle */}
                          <div
                            data-session-event="true"
                            aria-label={t("resizeSession")}
                            onPointerDown={(event) => startResizingBottom(event, entry)}
                            style={{
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: 2,
                              height: 6,
                              borderRadius: 999,
                              background: "var(--app-fg-muted)",
                              opacity: 0.2,
                              cursor: "ns-resize",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
