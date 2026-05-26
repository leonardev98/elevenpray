"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseAccentStyles } from "../../lib/course-styles";
import type { MockCourseExtended } from "../../lib/mock-course-data";
import { CourseProgressBar } from "./CourseProgressBar";

interface CourseCardProps {
  course: MockCourseExtended;
  onEdit?: (course: MockCourseExtended) => void;
  onDelete?: (course: MockCourseExtended) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const t = useTranslations("studentCourses");
  const tCommon = useTranslations("common");
  const styles = getCourseAccentStyles(course.accent);
  const hex = course.colorHex ?? null;
  const showProfessor = course.professor && course.professor !== "—";
  const showMenu = Boolean(onEdit || onDelete);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <article
      className={cn(
        "course-card student-card relative flex flex-col p-5 transition",
        styles.hoverBorder,
      )}
      style={
        hex
          ? {
              borderLeftWidth: 3,
              borderLeftStyle: "solid",
              borderLeftColor: hex,
            }
          : undefined
      }
    >
      <Link
        href={`/app/courses/${course.id}`}
        aria-label={course.name}
        className="absolute inset-0 z-0 rounded-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
      />

      <span
        className={cn(
          "pointer-events-none relative z-10 inline-block w-fit rounded-lg border px-2.5 py-0.5 text-xs font-semibold",
          !hex && styles.badge,
        )}
        style={
          hex
            ? {
                backgroundColor: `${hex}26`,
                borderColor: hex,
                color: "var(--text-primary)",
              }
            : undefined
        }
      >
        {course.code}
      </span>
      <h3 className="pointer-events-none relative z-10 mt-3 text-lg font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
        {course.name}
      </h3>
      {showProfessor ? (
        <p className="pointer-events-none relative z-10 mt-1 text-sm text-[var(--text-muted)]">{course.professor}</p>
      ) : null}
      <div className="pointer-events-none relative z-10 mt-3 flex flex-wrap gap-1.5">
        {course.classDays.map((day) => (
          <span key={day} className="course-day-chip">
            {day}
          </span>
        ))}
      </div>
      <div className="pointer-events-none relative z-10 mt-4 space-y-1.5">
        <CourseProgressBar percent={course.progressPercent} accent={course.accent} colorHex={hex} />
        <p className="text-xs text-[var(--text-muted)]">
          {t("weeksProgress", {
            current: course.weeksCurrent,
            total: course.weeksTotal,
          })}
        </p>
      </div>

      {showMenu ? (
        <div ref={menuRef} className="absolute right-2 top-2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            aria-label={t("courseMenuLabel")}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-[var(--app-fg-secondary)] transition-colors",
              "hover:bg-[var(--app-surface-elevated)] hover:text-[var(--app-fg)]",
              menuOpen && "bg-[var(--app-surface-elevated)] text-[var(--app-fg)]",
            )}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-app-modal"
            >
              {onEdit ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(course);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] transition-colors hover:bg-[var(--app-surface-elevated)]"
                >
                  <Edit3 className="h-4 w-4 shrink-0 text-[var(--app-fg-secondary)]" aria-hidden />
                  {tCommon("edit")}
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(course);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--error)] transition-colors hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)]"
                >
                  <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                  {tCommon("delete")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
