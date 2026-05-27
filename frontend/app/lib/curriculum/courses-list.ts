import type { CycleFilter } from "@/app/[locale]/(protected)/app/courses/components/CycleSelector";
import type { CurriculumCourse } from "./types";

export interface CurriculumListFilterOptions {
  /** Ciclo académico actual (perfil o inferido desde la malla). */
  activeCycle?: number;
}

export function parseProfileCycle(cycle: string | null | undefined): number | null {
  if (!cycle) return null;
  const match = cycle.match(/(\d+)/);
  if (!match) return null;
  return Math.min(12, Math.max(1, Number.parseInt(match[1]!, 10)));
}

function scoreCycle(courses: CurriculumCourse[], cycleNumber: number): number {
  const inCycle = courses.filter((c) => c.cycleNumber === cycleNumber);
  const studying = inCycle.filter((c) => c.status === "in_progress").length;
  const active = inCycle.filter(
    (c) => c.status === "pending" || c.status === "in_progress",
  ).length;
  return studying * 100 + active * 10 + inCycle.length;
}

/**
 * Ciclo que el estudiante cursa ahora.
 * Usa el perfil solo si hay cursos en ese ciclo; si no, el ciclo con más actividad en la malla.
 */
export function resolveActiveCycleNumber(
  courses: CurriculumCourse[],
  profileCycle?: number | null,
): number {
  if (courses.length === 0) return profileCycle ?? 1;

  const cycleNumbers = [...new Set(courses.map((c) => c.cycleNumber))].sort((a, b) => a - b);

  if (
    profileCycle != null &&
    courses.some((c) => c.cycleNumber === profileCycle)
  ) {
    return profileCycle;
  }

  return [...cycleNumbers].sort((a, b) => scoreCycle(courses, b) - scoreCycle(courses, a) || a - b)[0]!;
}

export function countCoursesByCycle(courses: CurriculumCourse[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const c of courses) {
    map.set(c.cycleNumber, (map.get(c.cycleNumber) ?? 0) + 1);
  }
  return map;
}

/** Filtra cursos de malla para la vista «Cursos». */
export function filterCurriculumCoursesForList(
  courses: CurriculumCourse[],
  filter: CycleFilter,
  options?: CurriculumListFilterOptions,
): CurriculumCourse[] {
  if (filter === "current") {
    const cycle = options?.activeCycle ?? resolveActiveCycleNumber(courses);
    return courses
      .filter((c) => c.cycleNumber === cycle)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  if (filter === "all") {
    return [...courses].sort(
      (a, b) => a.cycleNumber - b.cycleNumber || a.sortOrder - b.sortOrder,
    );
  }
  return courses
    .filter((c) => c.cycleNumber === filter)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findCurriculumCourseByListId(
  courses: CurriculumCourse[],
  listId: string,
): CurriculumCourse | undefined {
  return courses.find((c) => c.id === listId || c.linkedCourseId === listId);
}

/** Filtro inicial: ciclo actual si hay cursos; si no, todos. */
export function defaultCycleFilterForCurriculum(
  courses: CurriculumCourse[],
  profileCycle?: number | null,
): CycleFilter {
  if (courses.length === 0) return "current";
  const activeCycle = resolveActiveCycleNumber(courses, profileCycle);
  if (courses.some((c) => c.cycleNumber === activeCycle)) {
    return "current";
  }
  return "all";
}
