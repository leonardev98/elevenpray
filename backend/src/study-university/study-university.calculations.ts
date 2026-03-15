import type { ScheduleConflict, UniversityWeekday } from './study-university.types';

export interface ConflictComparableSchedule {
  courseId: string;
  weekday: UniversityWeekday;
  startTime: string;
  endTime: string;
}

export interface ConflictComparableCourse {
  id: string;
  name: string;
}

export function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

export function detectConflicts(
  courses: ConflictComparableCourse[],
  schedules: ConflictComparableSchedule[],
): ScheduleConflict[] {
  const byCourse = new Map(courses.map((course) => [course.id, course]));
  const conflicts: ScheduleConflict[] = [];
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];
      if (a.courseId === b.courseId) continue;
      if (a.weekday !== b.weekday) continue;
      if (!hasTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) continue;
      const courseA = byCourse.get(a.courseId);
      const courseB = byCourse.get(b.courseId);
      if (!courseA || !courseB) continue;
      conflicts.push({
        day: a.weekday,
        courseId: courseA.id,
        courseName: courseA.name,
        conflictingCourseId: courseB.id,
        conflictingCourseName: courseB.name,
        startTime: a.startTime,
        endTime: a.endTime,
        conflictingStartTime: b.startTime,
        conflictingEndTime: b.endTime,
      });
    }
  }
  return conflicts;
}

export function weightedAverageInPercent(
  items: Array<{ weight: number; score: number; maxScore: number }>,
): number | null {
  if (items.length === 0) return null;
  let weightedScore = 0;
  let totalWeight = 0;
  for (const item of items) {
    weightedScore += (item.score / item.maxScore) * item.weight;
    totalWeight += item.weight;
  }
  if (totalWeight <= 0) return null;
  return Number(((weightedScore / totalWeight) * 100).toFixed(2));
}

export function attendancePercent(
  records: Array<{ status: 'present' | 'late' | 'absent' | 'justified' }>,
): number {
  if (records.length === 0) return 0;
  const attended = records.filter(
    (record) =>
      record.status === 'present' ||
      record.status === 'late' ||
      record.status === 'justified',
  ).length;
  return Math.round((attended / records.length) * 100);
}
