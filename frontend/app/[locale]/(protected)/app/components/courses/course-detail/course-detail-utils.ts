import type { MockCourseExtended } from "../../../lib/mock-course-data";

export const DEFAULT_COURSE_HEX = "#0D9488";

export function courseHex(course: MockCourseExtended): string {
  return course.colorHex?.trim() || DEFAULT_COURSE_HEX;
}

export function mondayWeekIndexFromDate(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function dayLetterFromName(day: string): string {
  const n = day.toLowerCase();
  if (n.startsWith("mié") || n.startsWith("mie")) return "X";
  return day.slice(0, 1).toUpperCase();
}

export function classDayLetters(course: MockCourseExtended): string[] {
  if (course.classDayLetters?.length) return course.classDayLetters;
  return course.classDays.map(dayLetterFromName);
}
