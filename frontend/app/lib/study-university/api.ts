import { getAuthHeaders, getBaseUrl } from "../api";
import type {
  Assignment,
  AttendanceStatus,
  ClassSession,
  Course,
  CourseColorToken,
  CourseSchedule,
  CourseType,
  GradeItem,
  ScheduleConflict,
  Semester,
  StudyFocusSession,
  UniversityWorkspaceConfig,
  UniversityWorkspaceState,
  Weekday,
  FocusStatus,
} from "./types";

const baseStudyUrl = (workspaceId: string) =>
  `${getBaseUrl()}/study-university/workspaces/${workspaceId}`;

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCourse(raw: Record<string, unknown>): Course {
  return {
    id: String(raw.id),
    workspaceId: String(raw.workspaceId ?? raw.workspace_id),
    semesterId: (raw.semesterId ?? raw.semester_id ?? null) as string | null,
    name: String(raw.name ?? ""),
    professor: (raw.professor ?? null) as string | null,
    credits: parseNumber(raw.credits),
    classroom: (raw.classroom ?? null) as string | null,
    courseType: (raw.courseType ?? raw.course_type ?? "lecture") as CourseType,
    colorToken: (raw.colorToken ?? raw.color_token ?? "blue") as CourseColorToken,
    icon: (raw.icon ?? null) as string | null,
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    archived: Boolean(raw.archived ?? false),
  };
}

function normalizeState(data: Record<string, unknown>): UniversityWorkspaceState {
  const config = (data.config as Record<string, unknown> | null) ?? null;
  const toConfig = (raw: Record<string, unknown>): UniversityWorkspaceConfig => ({
    id: String(raw.id),
    workspaceId: String(raw.workspaceId ?? raw.workspace_id),
    subtypeCode: String(raw.subtypeCode ?? raw.subtype_code ?? "university"),
    currentSemesterLabel: (raw.currentSemesterLabel ?? raw.current_semester_label ?? null) as string | null,
    startDate: (raw.startDate ?? raw.start_date ?? null) as string | null,
    endDate: (raw.endDate ?? raw.end_date ?? null) as string | null,
    gradeScale: (raw.gradeScale ?? raw.grade_scale ?? "0_100") as UniversityWorkspaceConfig["gradeScale"],
    creditGoal: parseNumber(raw.creditGoal ?? raw.credit_goal),
    autoGenerateSessions: Boolean(raw.autoGenerateSessions ?? raw.auto_generate_sessions ?? true),
    remindersEnabled: Boolean(raw.remindersEnabled ?? raw.reminders_enabled ?? true),
    conflictDetectionEnabled: Boolean(raw.conflictDetectionEnabled ?? raw.conflict_detection_enabled ?? true),
    aiSummaryEnabled: Boolean(raw.aiSummaryEnabled ?? raw.ai_summary_enabled ?? true),
    onboardingCompleted: Boolean(raw.onboardingCompleted ?? raw.onboarding_completed ?? false),
    onboardingStep: Number(raw.onboardingStep ?? raw.onboarding_step ?? 1),
  });

  return {
    config: config ? toConfig(config) : null,
    semesters: ((data.semesters ?? []) as Record<string, unknown>[]).map(
      (raw): Semester => ({
        id: String(raw.id),
        workspaceId: String(raw.workspaceId ?? raw.workspace_id),
        name: String(raw.name ?? ""),
        startDate: (raw.startDate ?? raw.start_date ?? null) as string | null,
        endDate: (raw.endDate ?? raw.end_date ?? null) as string | null,
        isCurrent: Boolean(raw.isCurrent ?? raw.is_current ?? false),
        creditGoal: parseNumber(raw.creditGoal ?? raw.credit_goal),
      }),
    ),
    courses: ((data.courses ?? []) as Record<string, unknown>[]).map(normalizeCourse),
    schedules: ((data.schedules ?? []) as Record<string, unknown>[]).map(
      (raw): CourseSchedule => ({
        id: String(raw.id),
        courseId: String(raw.courseId ?? raw.course_id),
        workspaceId: String(raw.workspaceId ?? raw.workspace_id),
        weekday: (raw.weekday ?? "monday") as Weekday,
        startTime: String(raw.startTime ?? raw.start_time ?? "08:00"),
        endTime: String(raw.endTime ?? raw.end_time ?? "09:00"),
        classroom: (raw.classroom ?? null) as string | null,
      }),
    ),
    sessions: ((data.sessions ?? []) as Record<string, unknown>[]).map(
      (raw): ClassSession => ({
        id: String(raw.id),
        workspaceId: String(raw.workspaceId ?? raw.workspace_id),
        semesterId: (raw.semesterId ?? raw.semester_id ?? null) as string | null,
        courseId: String(raw.courseId ?? raw.course_id),
        scheduleId: (raw.scheduleId ?? raw.schedule_id ?? null) as string | null,
        sessionDate: String(raw.sessionDate ?? raw.session_date),
        startTime: String(raw.startTime ?? raw.start_time),
        endTime: String(raw.endTime ?? raw.end_time),
        classroom: (raw.classroom ?? null) as string | null,
        title: (raw.title ?? null) as string | null,
        notesHtml: (raw.notesHtml ?? raw.notes_html ?? null) as string | null,
        notesJson: (raw.notesJson ?? raw.notes_json ?? null) as Record<string, unknown> | null,
        aiSummaryMock: (raw.aiSummaryMock ?? raw.ai_summary_mock ?? null) as string | null,
        generatedFromSchedule: Boolean(raw.generatedFromSchedule ?? raw.generated_from_schedule ?? false),
      }),
    ),
    assignments: ((data.assignments ?? []) as Record<string, unknown>[]).map(
      (raw): Assignment => ({
        id: String(raw.id),
        workspaceId: String(raw.workspaceId ?? raw.workspace_id),
        semesterId: (raw.semesterId ?? raw.semester_id ?? null) as string | null,
        courseId: String(raw.courseId ?? raw.course_id),
        classSessionId: (raw.classSessionId ?? raw.class_session_id ?? null) as string | null,
        title: String(raw.title ?? ""),
        description: (raw.description ?? null) as string | null,
        deadline: String(raw.deadline),
        priority: (raw.priority ?? "medium") as Assignment["priority"],
        status: (raw.status ?? "pending") as Assignment["status"],
        attachments: (raw.attachments ?? null) as unknown[] | null,
      }),
    ),
    focusSessions: ((data.focusSessions ?? data.focus_sessions ?? []) as Record<string, unknown>[]).map(
      (raw): StudyFocusSession => ({
        id: String(raw.id),
        workspaceId: String(raw.workspaceId ?? raw.workspace_id),
        courseId: (raw.courseId ?? raw.course_id ?? null) as string | null,
        durationMinutes: Number(raw.durationMinutes ?? raw.duration_minutes ?? 25),
        status: (raw.status ?? "in_progress") as StudyFocusSession["status"],
        startedAt: String(raw.startedAt ?? raw.started_at ?? new Date().toISOString()),
        completedAt: (raw.completedAt ?? raw.completed_at ?? null) as string | null,
      }),
    ),
    conflicts: ((data.conflicts ?? []) as ScheduleConflict[]),
    stats: (data.stats as UniversityWorkspaceState["stats"]) ?? {
      activeCourses: 0,
      pendingAssignments: 0,
      classesToday: 0,
      credits: 0,
    },
    attendanceByCourse: (data.attendanceByCourse as Record<string, number>) ?? {},
    gradeAveragesByCourse: (data.gradeAveragesByCourse as Record<string, number | null>) ?? {},
  };
}

async function fetchJson<T>(
  url: string,
  token: string,
  method: "GET" | "POST" | "PATCH" = "GET",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      ...getAuthHeaders(token),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error((payload as { message?: string }).message ?? "Error in study university API");
  }
  return res.json();
}

export async function getUniversityWorkspaceState(
  token: string,
  workspaceId: string,
): Promise<UniversityWorkspaceState> {
  const data = await fetchJson<Record<string, unknown>>(`${baseStudyUrl(workspaceId)}/state`, token);
  return normalizeState(data);
}

export async function upsertUniversityConfig(
  token: string,
  workspaceId: string,
  data: Record<string, unknown>,
): Promise<UniversityWorkspaceConfig> {
  const payload = await fetchJson<Record<string, unknown>>(
    `${baseStudyUrl(workspaceId)}/config`,
    token,
    "PATCH",
    data,
  );
  return normalizeState({ config: payload }).config as UniversityWorkspaceConfig;
}

export async function createUniversitySemester(
  token: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<Semester> {
  const payload = await fetchJson<Record<string, unknown>>(
    `${baseStudyUrl(workspaceId)}/semesters`,
    token,
    "POST",
    body,
  );
  return {
    id: String(payload.id),
    workspaceId: String(payload.workspaceId ?? payload.workspace_id),
    name: String(payload.name),
    startDate: (payload.startDate ?? payload.start_date ?? null) as string | null,
    endDate: (payload.endDate ?? payload.end_date ?? null) as string | null,
    isCurrent: Boolean(payload.isCurrent ?? payload.is_current ?? false),
    creditGoal: parseNumber(payload.creditGoal ?? payload.credit_goal),
  };
}

export async function createUniversityCourse(
  token: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<{ course: Course; conflicts: ScheduleConflict[] }> {
  const payload = await fetchJson<Record<string, unknown>>(
    `${baseStudyUrl(workspaceId)}/courses`,
    token,
    "POST",
    body,
  );
  return {
    course: normalizeCourse(payload.course as Record<string, unknown>),
    conflicts: (payload.conflicts as ScheduleConflict[]) ?? [],
  };
}

export async function reorderUniversityCourses(
  token: string,
  workspaceId: string,
  orderedCourseIds: string[],
): Promise<Course[]> {
  const payload = await fetchJson<Record<string, unknown>[]>(
    `${baseStudyUrl(workspaceId)}/courses/reorder`,
    token,
    "PATCH",
    { orderedCourseIds },
  );
  return payload.map(normalizeCourse);
}

export async function generateUniversitySessions(
  token: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<{ generated: number }> {
  return fetchJson<{ generated: number }>(
    `${baseStudyUrl(workspaceId)}/sessions/generate`,
    token,
    "POST",
    body,
  );
}

export async function createUniversityAssignment(
  token: string,
  workspaceId: string,
  body: Record<string, unknown>,
): Promise<Assignment> {
  return fetchJson<Assignment>(`${baseStudyUrl(workspaceId)}/assignments`, token, "POST", body);
}

export async function updateUniversityAssignmentStatus(
  token: string,
  workspaceId: string,
  assignmentId: string,
  status: Assignment["status"],
): Promise<Assignment> {
  return fetchJson<Assignment>(
    `${baseStudyUrl(workspaceId)}/assignments/${assignmentId}/status`,
    token,
    "PATCH",
    { status },
  );
}

export async function upsertUniversityAttendance(
  token: string,
  workspaceId: string,
  payload: {
    classSessionId: string;
    courseId: string;
    status: AttendanceStatus;
    note?: string;
  },
): Promise<{
  attendance: { id: string; status: AttendanceStatus };
  attendanceByCourse: Record<string, number>;
}> {
  return fetchJson(`${baseStudyUrl(workspaceId)}/attendance`, token, "POST", payload);
}

export async function createUniversityGradeItem(
  token: string,
  workspaceId: string,
  payload: Record<string, unknown>,
): Promise<{ gradeItem: GradeItem; gradeAveragesByCourse: Record<string, number | null> }> {
  return fetchJson(`${baseStudyUrl(workspaceId)}/grades`, token, "POST", payload);
}

export async function getUniversityClassSessionDetail(
  token: string,
  workspaceId: string,
  sessionId: string,
): Promise<Record<string, unknown>> {
  return fetchJson(`${baseStudyUrl(workspaceId)}/sessions/${sessionId}`, token);
}

export async function updateUniversityClassSessionNotes(
  token: string,
  workspaceId: string,
  sessionId: string,
  payload: { notesHtml?: string; notesJson?: Record<string, unknown>; aiSummaryMock?: string },
): Promise<ClassSession> {
  return fetchJson(
    `${baseStudyUrl(workspaceId)}/sessions/${sessionId}/notes`,
    token,
    "PATCH",
    payload,
  );
}

export async function startUniversityFocusSession(
  token: string,
  workspaceId: string,
  payload: { durationMinutes: number; courseId?: string },
): Promise<StudyFocusSession> {
  return fetchJson(`${baseStudyUrl(workspaceId)}/focus-sessions`, token, "POST", payload);
}

export async function completeUniversityFocusSession(
  token: string,
  workspaceId: string,
  focusSessionId: string,
  status: FocusStatus = "completed",
): Promise<StudyFocusSession> {
  return fetchJson(
    `${baseStudyUrl(workspaceId)}/focus-sessions/${focusSessionId}`,
    token,
    "PATCH",
    { status },
  );
}
