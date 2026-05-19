import type { CourseAccent } from "./mock-course-data";

export type CourseAccentStyles = {
  badge: string;
  hoverBorder: string;
  tabActive: string;
  progressFill: string;
};

const ACCENT_STYLES: Record<CourseAccent, CourseAccentStyles> = {
  violet: {
    badge: "bg-violet-500/25 text-violet-200 border-violet-400/40",
    hoverBorder: "hover:border-violet-400/50 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.25)]",
    tabActive: "data-[state=active]:border-violet-400 data-[state=active]:text-violet-200",
    progressFill: "bg-violet-400",
  },
  teal: {
    badge: "bg-teal-500/25 text-teal-200 border-teal-400/40",
    hoverBorder: "hover:border-teal-400/50 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.25)]",
    tabActive: "data-[state=active]:border-teal-400 data-[state=active]:text-teal-200",
    progressFill: "bg-teal-400",
  },
  amber: {
    badge: "bg-amber-500/25 text-amber-200 border-amber-400/40",
    hoverBorder: "hover:border-amber-400/50 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.25)]",
    tabActive: "data-[state=active]:border-amber-400 data-[state=active]:text-amber-200",
    progressFill: "bg-amber-400",
  },
  rose: {
    badge: "bg-rose-500/25 text-rose-200 border-rose-400/40",
    hoverBorder: "hover:border-rose-400/50 hover:shadow-[0_0_0_1px_rgba(251,113,133,0.25)]",
    tabActive: "data-[state=active]:border-rose-400 data-[state=active]:text-rose-200",
    progressFill: "bg-rose-400",
  },
  sky: {
    badge: "bg-sky-500/25 text-sky-200 border-sky-400/40",
    hoverBorder: "hover:border-sky-400/50 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.25)]",
    tabActive: "data-[state=active]:border-sky-400 data-[state=active]:text-sky-200",
    progressFill: "bg-sky-400",
  },
  emerald: {
    badge: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    hoverBorder: "hover:border-emerald-400/50 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.25)]",
    tabActive: "data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-200",
    progressFill: "bg-emerald-400",
  },
};

export function getCourseAccentStyles(accent: CourseAccent): CourseAccentStyles {
  return ACCENT_STYLES[accent];
}
