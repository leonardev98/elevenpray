import type { CourseColorToken } from "./types";

export const COURSE_COLOR_TOKENS: CourseColorToken[] = [
  "blue",
  "violet",
  "emerald",
  "amber",
  "rose",
  "cyan",
  "indigo",
  "teal",
];

export const COURSE_COLOR_CLASSES: Record<
  CourseColorToken,
  { bg: string; border: string; text: string; soft: string }
> = {
  blue: {
    bg: "bg-blue-500",
    border: "border-blue-400/50",
    text: "text-blue-600 dark:text-blue-300",
    soft: "bg-blue-400/15",
  },
  violet: {
    bg: "bg-violet-500",
    border: "border-violet-400/50",
    text: "text-violet-600 dark:text-violet-300",
    soft: "bg-violet-400/15",
  },
  emerald: {
    bg: "bg-emerald-500",
    border: "border-emerald-400/50",
    text: "text-emerald-600 dark:text-emerald-300",
    soft: "bg-emerald-400/15",
  },
  amber: {
    bg: "bg-amber-500",
    border: "border-amber-400/50",
    text: "text-amber-600 dark:text-amber-300",
    soft: "bg-amber-400/15",
  },
  rose: {
    bg: "bg-rose-500",
    border: "border-rose-400/50",
    text: "text-rose-600 dark:text-rose-300",
    soft: "bg-rose-400/15",
  },
  cyan: {
    bg: "bg-cyan-500",
    border: "border-cyan-400/50",
    text: "text-cyan-600 dark:text-cyan-300",
    soft: "bg-cyan-400/15",
  },
  indigo: {
    bg: "bg-indigo-500",
    border: "border-indigo-400/50",
    text: "text-indigo-600 dark:text-indigo-300",
    soft: "bg-indigo-400/15",
  },
  teal: {
    bg: "bg-teal-500",
    border: "border-teal-400/50",
    text: "text-teal-600 dark:text-teal-300",
    soft: "bg-teal-400/15",
  },
};
