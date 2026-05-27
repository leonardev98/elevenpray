import type { CurriculumStats, CurriculumStatus } from "./types";

export interface PrerequisiteEdge {
  courseId: string;
  prerequisiteId: string;
}

export function buildUnlocksMap(edges: PrerequisiteEdge[]): Map<string, string[]> {
  const unlocks = new Map<string, string[]>();
  for (const { courseId, prerequisiteId } of edges) {
    if (!unlocks.has(prerequisiteId)) unlocks.set(prerequisiteId, []);
    unlocks.get(prerequisiteId)!.push(courseId);
  }
  return unlocks;
}

export function computeUnlockState(
  _courseId: string,
  status: CurriculumStatus,
  prerequisiteIds: string[],
  statusById: Map<string, CurriculumStatus>,
): boolean {
  if (status === "approved" || status === "in_progress") return true;
  if (prerequisiteIds.length === 0) return true;
  return prerequisiteIds.every((id) => statusById.get(id) === "approved");
}

export function computeCurriculumStats(
  courses: Array<{ credits: number; status: CurriculumStatus; cycleNumber: number }>,
): CurriculumStats {
  const totalCourses = courses.length;
  let approvedCount = 0;
  let inProgressCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let totalCredits = 0;
  let approvedCredits = 0;
  const cycles = new Set<number>();

  for (const c of courses) {
    cycles.add(c.cycleNumber);
    totalCredits += c.credits;
    if (c.status === "approved") {
      approvedCount += 1;
      approvedCredits += c.credits;
    } else if (c.status === "in_progress") inProgressCount += 1;
    else if (c.status === "failed") failedCount += 1;
    else pendingCount += 1;
  }

  const progressPercent =
    totalCredits > 0 ? Math.round((approvedCredits / totalCredits) * 100) : 0;

  return {
    totalCourses,
    approvedCount,
    inProgressCount,
    pendingCount,
    failedCount,
    totalCredits,
    approvedCredits,
    progressPercent,
    cyclesWithCourses: cycles.size,
  };
}

export function cycleToRoman(n: number): string {
  const romans: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let num = n;
  let result = "";
  for (const [value, numeral] of romans) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result || String(n);
}

export function estimateGraduationCycles(
  approvedCredits: number,
  totalCredits: number,
  cyclesWithCourses: number,
  approvedCount: number,
): number | null {
  if (totalCredits <= 0 || cyclesWithCourses <= 0 || approvedCount <= 0) return null;
  const creditsPerCycle = totalCredits / cyclesWithCourses;
  const remaining = Math.max(0, totalCredits - approvedCredits);
  return Math.ceil(remaining / creditsPerCycle);
}
