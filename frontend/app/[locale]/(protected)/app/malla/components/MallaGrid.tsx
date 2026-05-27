"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { CurriculumCourse } from "@/app/lib/curriculum/types";
import { cycleToRoman } from "@/app/lib/curriculum/curriculum-utils";
import { MallaCourseCard } from "./MallaCourseCard";

interface MallaGridProps {
  coursesByCycle: Map<number, CurriculumCourse[]>;
  cycleNumbers: number[];
  searchQuery: string;
  getCourseById: (id: string) => CurriculumCourse | null;
  onSelectCourse: (course: CurriculumCourse) => void;
}

export function MallaGrid({
  coursesByCycle,
  cycleNumbers,
  searchQuery,
  getCourseById,
  onSelectCourse,
}: MallaGridProps) {
  const t = useTranslations("studentMalla");
  const q = searchQuery.trim().toLowerCase();

  const filteredCycles = useMemo(() => {
    if (!q) return cycleNumbers;
    return cycleNumbers.filter((cycle) => {
      const list = coursesByCycle.get(cycle) ?? [];
      return list.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.code?.toLowerCase().includes(q) ?? false),
      );
    });
  }, [cycleNumbers, coursesByCycle, q]);

  return (
    <div className="space-y-8">
      {filteredCycles.map((cycle) => {
        const courses = (coursesByCycle.get(cycle) ?? []).filter(
          (c) =>
            !q ||
            c.name.toLowerCase().includes(q) ||
            (c.code?.toLowerCase().includes(q) ?? false),
        );
        const roman = cycleToRoman(cycle);
        const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
        const approved = courses.filter((c) => c.status === "approved").length;

        return (
          <section key={cycle} className="space-y-3">
            <div className="flex flex-wrap items-end gap-3 border-b border-[var(--border)] pb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-body)]">
                  {t("cycleShort", { roman })}
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {t("cycleLabel", { roman })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[var(--text-body)]">
                  {t("coursesCount", { count: courses.length })}
                </span>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[var(--text-body)]">
                  {t("creditsTotal", { count: totalCredits })}
                </span>
                <span className="rounded-full border border-[var(--malla-status-approved-ring)] bg-[var(--malla-progress-bg)] px-2.5 py-1 font-semibold text-[var(--malla-progress-fg)]">
                  {t("cycleProgress", { approved, total: courses.length })}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {courses.map((course) => {
                const blockedNames = course.prerequisiteIds
                  .map((id) => getCourseById(id))
                  .filter((p) => p && p.status !== "approved")
                  .map((p) => p!.name);
                return (
                  <MallaCourseCard
                    key={course.id}
                    course={course}
                    blockedNames={blockedNames}
                    onClick={() => onSelectCourse(course)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
