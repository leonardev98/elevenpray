"use client";

import { useEffect, useMemo, useRef } from "react";
import { addDays } from "date-fns";
import { useAuth } from "@/app/providers/auth-provider";
import { useStudyUniversity } from "@/app/lib/study-university/hooks";
import { useStudyBackendLink } from "./study-backend-link";
import {
  buildBackendCalendarEvents,
  localEventsToCalendar,
  mergeCalendarEvents,
} from "./build-calendar-events";
import type { CalendarEvent } from "./calendar-event-types";
import { useScheduleStore } from "./use-schedule-store";

export function useStudentCalendarEvents(weekStart: Date) {
  const { token } = useAuth();
  const { workspaceId, ensureWorkspace } = useStudyBackendLink(token);
  const study = useStudyUniversity(workspaceId ?? "", token);
  const { events: localEvents, hydrated } = useScheduleStore();

  const loadRef = useRef(study.load);
  loadRef.current = study.load;

  useEffect(() => {
    void ensureWorkspace().then(() => loadRef.current());
  }, [ensureWorkspace, workspaceId]);

  const events = useMemo((): CalendarEvent[] => {
    if (!hydrated) return [];
    const backend = workspaceId ? buildBackendCalendarEvents(study.state, weekStart) : [];
    const local = localEventsToCalendar(localEvents);
    return mergeCalendarEvents(backend, local);
  }, [hydrated, workspaceId, study.state, weekStart, localEvents]);

  const weekEnd = addDays(weekStart, 6);

  return {
    events,
    courses: study.state.courses,
    loading: study.loading,
    weekStart,
    weekEnd,
    reload: study.load,
  };
}
