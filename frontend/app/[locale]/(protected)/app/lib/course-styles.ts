import type { CourseAccent } from "./mock-course-data";

export type CourseAccentStyles = {
  badge: string;
  hoverBorder: string;
  tabActive: string;
  progressFill: string;
};

const ACCENT_STYLES: Record<CourseAccent, CourseAccentStyles> = {
  violet: {
    badge: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/30",
    hoverBorder: "hover:border-[var(--course-4-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-4-fg)] data-[state=active]:text-[var(--course-4-fg)]",
    progressFill: "bg-[var(--course-4-fg)]",
  },
  teal: {
    badge: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/30",
    hoverBorder: "hover:border-[var(--course-1-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-1-fg)] data-[state=active]:text-[var(--course-1-fg)]",
    progressFill: "bg-[var(--course-1-fg)]",
  },
  amber: {
    badge: "bg-[var(--course-2-bg)] text-[var(--course-2-fg)] border-[var(--course-2-fg)]/30",
    hoverBorder: "hover:border-[var(--course-2-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-2-fg)] data-[state=active]:text-[var(--course-2-fg)]",
    progressFill: "bg-[var(--course-2-fg)]",
  },
  rose: {
    badge: "bg-[var(--course-6-bg)] text-[var(--course-6-fg)] border-[var(--course-6-fg)]/30",
    hoverBorder: "hover:border-[var(--course-6-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-6-fg)] data-[state=active]:text-[var(--course-6-fg)]",
    progressFill: "bg-[var(--course-6-fg)]",
  },
  sky: {
    badge: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)] border-[var(--course-3-fg)]/30",
    hoverBorder: "hover:border-[var(--course-3-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-3-fg)] data-[state=active]:text-[var(--course-3-fg)]",
    progressFill: "bg-[var(--course-3-fg)]",
  },
  emerald: {
    badge: "bg-[var(--course-5-bg)] text-[var(--course-5-fg)] border-[var(--course-5-fg)]/30",
    hoverBorder: "hover:border-[var(--course-5-fg)]/40",
    tabActive: "data-[state=active]:border-[var(--course-5-fg)] data-[state=active]:text-[var(--course-5-fg)]",
    progressFill: "bg-[var(--course-5-fg)]",
  },
};

export function getCourseAccentStyles(accent: CourseAccent): CourseAccentStyles {
  return ACCENT_STYLES[accent];
}
