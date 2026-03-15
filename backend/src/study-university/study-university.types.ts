export type UniversityGradeScale = '0_20' | '0_100' | 'A_F';

export type UniversityCourseType = 'lecture' | 'lab' | 'seminar' | 'workshop' | 'other';

export type UniversityCourseColorToken =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'indigo'
  | 'teal';

export type UniversityWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type UniversityAssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';

export type UniversityAssignmentStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'done'
  | 'late';

export type UniversityAttendanceStatus = 'present' | 'late' | 'absent' | 'justified';

export type UniversityGradeItemType =
  | 'exam'
  | 'quiz'
  | 'project'
  | 'assignment'
  | 'participation'
  | 'other';

export type StudyFocusStatus = 'in_progress' | 'completed' | 'cancelled';

export type StudyReminderKind = 'class_session' | 'assignment' | 'focus' | 'custom';

export interface ScheduleConflict {
  day: UniversityWeekday;
  courseId: string;
  courseName: string;
  conflictingCourseId: string;
  conflictingCourseName: string;
  startTime: string;
  endTime: string;
  conflictingStartTime: string;
  conflictingEndTime: string;
}
