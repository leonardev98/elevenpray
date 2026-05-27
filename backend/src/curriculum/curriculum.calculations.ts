import type { CurriculumCourseStatus } from './entities/curriculum-course.entity';

export interface PrerequisiteEdge {
  courseId: string;
  prerequisiteId: string;
}

/** prerequisiteId must be completed before courseId */
export function wouldCreatePrerequisiteCycle(
  courseId: string,
  newPrerequisiteIds: string[],
  edges: PrerequisiteEdge[],
): boolean {
  const adjacency = new Map<string, string[]>();
  for (const { courseId: c, prerequisiteId: p } of edges) {
    if (!adjacency.has(p)) adjacency.set(p, []);
    adjacency.get(p)!.push(c);
  }

  for (const prereqId of newPrerequisiteIds) {
    const visited = new Set<string>();
    const stack = [courseId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === prereqId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const next = adjacency.get(current) ?? [];
      for (const n of next) stack.push(n);
    }
  }
  return false;
}

export function computeUnlockState(
  courseId: string,
  status: CurriculumCourseStatus,
  prerequisiteIds: string[],
  statusById: Map<string, CurriculumCourseStatus>,
): boolean {
  if (status === 'approved' || status === 'in_progress') return true;
  if (prerequisiteIds.length === 0) return true;
  return prerequisiteIds.every((id) => statusById.get(id) === 'approved');
}

export function buildUnlocksMap(edges: PrerequisiteEdge[]): Map<string, string[]> {
  const unlocks = new Map<string, string[]>();
  for (const { courseId, prerequisiteId } of edges) {
    if (!unlocks.has(prerequisiteId)) unlocks.set(prerequisiteId, []);
    unlocks.get(prerequisiteId)!.push(courseId);
  }
  return unlocks;
}

export interface CurriculumStats {
  totalCourses: number;
  approvedCount: number;
  inProgressCount: number;
  pendingCount: number;
  failedCount: number;
  totalCredits: number;
  approvedCredits: number;
  progressPercent: number;
  cyclesWithCourses: number;
}

export function computeCurriculumStats(
  courses: Array<{ credits: number; status: CurriculumCourseStatus; cycleNumber: number }>,
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
    if (c.status === 'approved') {
      approvedCount += 1;
      approvedCredits += c.credits;
    } else if (c.status === 'in_progress') inProgressCount += 1;
    else if (c.status === 'failed') failedCount += 1;
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
