"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { useStudyUniversity } from "@/app/lib/study-university/hooks";
import { courseCodeFromCourse } from "../tasks/lib/map-assignment";
import type { Course } from "@/app/lib/study-university/types";
import { buildTodayDashboardEvents } from "./build-calendar-events";
import type { CalendarEvent } from "./calendar-event-types";
import { useStudyBackendLink } from "./study-backend-link";
import { todayYmd } from "./schedule-storage";

export function useHomeDashboard() {
  const { token } = useAuth();
  const { workspaceId, ensureWorkspace } = useStudyBackendLink(token);
  const study = useStudyUniversity(workspaceId ?? "", token);
  const today = todayYmd();

  const loadRef = useRef(study.load);
  loadRef.current = study.load;

  useEffect(() => {
    void ensureWorkspace().then(() => loadRef.current());
  }, [ensureWorkspace, workspaceId]);

  const { classesToday, upcomingTasks } = useMemo(
    () => buildTodayDashboardEvents(study.state, today),
    [study.state, today],
  );

  const courseById = useMemo(() => {
    const map = new Map(study.state.courses.map((c) => [c.id, c]));
    return (courseId?: string) => (courseId ? map.get(courseId) : undefined);
  }, [study.state.courses]);

  return {
    classesToday,
    upcomingTasks,
    courseById,
    today,
    loading: study.loading,
  };
}

export type HomeClassItem = CalendarEvent;
export type HomeTaskItem = CalendarEvent;

export function homeCourseLabel(course: Course | undefined): string {
  if (!course) return "";
  return courseCodeFromCourse(course);
}
