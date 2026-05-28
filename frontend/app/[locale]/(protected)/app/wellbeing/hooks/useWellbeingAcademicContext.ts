"use client";

import { useMemo } from "react";
import { useHomeDashboard } from "../../lib/use-home-dashboard";
import type { WellbeingAcademicContext } from "../lib/get-daily-action";

export function useWellbeingAcademicContext(): WellbeingAcademicContext {
  const { upcomingTasks, courseById } = useHomeDashboard();

  return useMemo(() => {
    const next = upcomingTasks[0];
    if (!next) return {};
    const course = courseById(next.courseId);
    return {
      courseName: course?.name,
      courseCode: course?.code ?? course?.name,
    };
  }, [upcomingTasks, courseById]);
}
