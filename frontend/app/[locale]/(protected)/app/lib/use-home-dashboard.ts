"use client";

import { useMemo } from "react";
import { parseISO } from "date-fns";
import { useScheduleStore } from "./use-schedule-store";
import { todayYmd } from "./schedule-storage";
import type { MockScheduleEvent } from "./mock-student-data";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function useHomeDashboard() {
  const { events, courses } = useScheduleStore();
  const today = todayYmd();

  const classesToday = useMemo(() => {
    return events
      .filter((e) => e.date === today && e.kind === "class")
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [events, today]);

  const upcomingTasks = useMemo(() => {
    const taskEvents = events.filter((e) => e.kind === "task" && e.date >= today);
    const sorted = [...taskEvents].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
    return sorted.slice(0, 5);
  }, [events, today]);

  const courseById = useMemo(() => {
    const map = new Map(courses.map((c) => [c.id, c]));
    return (courseId?: string) => (courseId ? map.get(courseId) : undefined);
  }, [courses]);

  return { classesToday, upcomingTasks, courseById, today };
}

export type HomeClassItem = MockScheduleEvent;
export type HomeTaskItem = MockScheduleEvent;
