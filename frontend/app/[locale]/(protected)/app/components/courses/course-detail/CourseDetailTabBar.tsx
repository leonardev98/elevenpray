"use client";

import { cn } from "@/lib/utils";
import { courseHex } from "./course-detail-utils";
import type { MockCourseExtended } from "../../../lib/mock-course-data";

export type CourseTabId =
  | "apuntes"
  | "clases"
  | "tareas"
  | "archivos"
  | "flashcards"
  | "quizzes";

const TABS: { id: CourseTabId; label: string }[] = [
  { id: "apuntes", label: "Apuntes" },
  { id: "clases", label: "Clases" },
  { id: "tareas", label: "Tareas" },
  { id: "archivos", label: "Archivos" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quizzes", label: "Quizzes" },
];

interface CourseDetailTabBarProps {
  course: MockCourseExtended;
  tabActivo: CourseTabId;
  onTabChange: (id: CourseTabId) => void;
}

export function CourseDetailTabBar({ course, tabActivo, onTabChange }: CourseDetailTabBarProps) {
  const hex = courseHex(course);

  return (
    <div className="border-b-[0.5px] border-[var(--border)]">
      <div
        role="tablist"
        aria-label="Secciones del curso"
        className="-mb-px flex gap-0 overflow-x-auto scrollbar-none"
      >
        {TABS.map((t) => {
          const active = tabActivo === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(t.id)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-150",
                active
                  ? "text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
              style={
                active
                  ? {
                      borderBottomColor: hex,
                    }
                  : undefined
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
