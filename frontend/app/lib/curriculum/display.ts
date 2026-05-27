import type { CourseColorToken } from "../study-university/types";
import type { MockCourseExtended, CourseAccent } from "@/app/[locale]/(protected)/app/lib/mock-course-data";
import type { CurriculumCourse } from "./types";

const TOKEN_TO_ACCENT: Record<CourseColorToken, CourseAccent> = {
  blue: "sky",
  violet: "violet",
  emerald: "emerald",
  amber: "amber",
  rose: "rose",
  cyan: "sky",
  indigo: "violet",
  teal: "teal",
};

const TOKEN_TO_HEX: Partial<Record<CourseColorToken, string>> = {
  blue: "#3b82f6",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

export function curriculumCourseToMock(course: CurriculumCourse): MockCourseExtended {
  const progressPercent =
    course.status === "approved" ? 100 : course.status === "in_progress" ? 40 : 0;
  return {
    id: course.linkedCourseId ?? course.id,
    name: course.name,
    code: course.code ?? "",
    color: course.colorToken,
    professor: "—",
    pendingTasks: 0,
    accent: TOKEN_TO_ACCENT[course.colorToken] ?? "violet",
    classDays: [],
    progressPercent,
    weeksCurrent: course.status === "in_progress" ? 4 : 0,
    weeksTotal: 16,
    streakDays: 0,
    colorHex: TOKEN_TO_HEX[course.colorToken] ?? null,
    credits: course.credits,
  };
}
