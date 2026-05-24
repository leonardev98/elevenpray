"use client";

import { cn } from "@/lib/utils";
import { getCourseAccentStyles } from "../../lib/course-styles";
import type { CourseAccent } from "../../lib/mock-course-data";

interface CourseProgressBarProps {
  percent: number;
  accent: CourseAccent;
  colorHex?: string | null;
  className?: string;
}

export function CourseProgressBar({ percent, accent, colorHex, className }: CourseProgressBarProps) {
  const styles = getCourseAccentStyles(accent);
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("course-progress-track", className)}>
      <div
        className={cn("course-progress-fill", !colorHex && styles.progressFill)}
        style={
          colorHex
            ? { width: `${clamped}%`, backgroundColor: colorHex }
            : { width: `${clamped}%` }
        }
      />
    </div>
  );
}
