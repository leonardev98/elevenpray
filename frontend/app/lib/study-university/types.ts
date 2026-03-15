export type UniversityGradeScale = "0_20" | "0_100" | "A_F";
export type CourseType = "lecture" | "lab" | "seminar" | "workshop" | "other";
export type CourseColorToken =
  | "blue"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "teal";
export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type AssignmentPriority = "low" | "medium" | "high" | "urgent";
export type AssignmentStatus = "pending" | "in_progress" | "submitted" | "done" | "late";
export type AttendanceStatus = "present" | "late" | "absent" | "justified";
export type GradeItemType = "exam" | "quiz" | "project" | "assignment" | "participation" | "other";
export type FocusStatus = "in_progress" | "completed" | "cancelled";

export interface Workspace {
  id: string;
  name: string;
  workspaceType: string;
  workspaceSubtypeId?: string | null;
}

export interface UniversityWorkspaceConfig {
  id: string;
  workspaceId: string;
  subtypeCode: string;
  currentSemesterLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  gradeScale: UniversityGradeScale;
  creditGoal: number | null;
  autoGenerateSessions: boolean;
  remindersEnabled: boolean;
  conflictDetectionEnabled: boolean;
  aiSummaryEnabled: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface Semester {
  id: string;
  workspaceId: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  creditGoal: number | null;
}

export interface Course {
  id: string;
  workspaceId: string;
  semesterId: string | null;
  name: string;
  professor: string | null;
  credits: number | null;
  classroom: string | null;
  courseType: CourseType;
  colorToken: CourseColorToken;
  icon: string | null;
  sortOrder: number;
  archived: boolean;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  workspaceId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  classroom: string | null;
}

export interface ClassSession {
  id: string;
  workspaceId: string;
  semesterId: string | null;
  courseId: string;
  scheduleId: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classroom: string | null;
  title: string | null;
  notesHtml: string | null;
  notesJson: Record<string, unknown> | null;
  aiSummaryMock: string | null;
  generatedFromSchedule: boolean;
}

export interface Assignment {
  id: string;
  workspaceId: string;
  semesterId: string | null;
  courseId: string;
  classSessionId: string | null;
  title: string;
  description: string | null;
  deadline: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  attachments: unknown[] | null;
}

export interface AttendanceRecord {
  id: string;
  workspaceId: string;
  courseId: string;
  classSessionId: string;
  status: AttendanceStatus;
  note: string | null;
}

export interface GradeItem {
  id: string;
  workspaceId: string;
  courseId: string;
  classSessionId: string | null;
  name: string;
  type: GradeItemType;
  weight: number;
  score: number | null;
  maxScore: number | null;
  gradeDate: string | null;
}

export interface CourseResource {
  id: string;
  workspaceId: string;
  courseId: string;
  title: string;
  kind: string;
  url: string | null;
  metadata: Record<string, unknown> | null;
}

export interface FlashcardDeck {
  id: string;
  workspaceId: string;
  courseId: string | null;
  classSessionId: string | null;
  title: string;
  description: string | null;
}

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  hint: string | null;
  dueAt: string | null;
  reviewCount: number;
}

export interface StudyFocusSession {
  id: string;
  workspaceId: string;
  courseId: string | null;
  durationMinutes: number;
  status: FocusStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface Reminder {
  id: string;
  workspaceId: string;
  title: string;
  note: string | null;
  remindAt: string;
  done: boolean;
}

export interface ScheduleConflict {
  day: Weekday;
  courseId: string;
  courseName: string;
  conflictingCourseId: string;
  conflictingCourseName: string;
  startTime: string;
  endTime: string;
  conflictingStartTime: string;
  conflictingEndTime: string;
}

export interface UniversityWorkspaceState {
  config: UniversityWorkspaceConfig | null;
  semesters: Semester[];
  courses: Course[];
  schedules: CourseSchedule[];
  sessions: ClassSession[];
  assignments: Assignment[];
  focusSessions: StudyFocusSession[];
  conflicts: ScheduleConflict[];
  stats: {
    activeCourses: number;
    pendingAssignments: number;
    classesToday: number;
    credits: number;
  };
  attendanceByCourse: Record<string, number>;
  gradeAveragesByCourse: Record<string, number | null>;
}
