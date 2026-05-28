"use client";

import { useCallback, useMemo, useState } from "react";
import {
  completeUniversityFocusSession,
  createUniversityAssignment,
  deleteUniversityAssignment,
  createUniversityCourse,
  createUniversityGradeItem,
  deleteUniversityGradeItem,
  updateUniversityGradeItem,
  createUniversitySemester,
  generateUniversitySessions,
  getUniversityWorkspaceState,
  reorderUniversityCourses,
  startUniversityFocusSession,
  updateUniversityAssignment,
  updateUniversityAssignmentStatus,
  updateUniversityClassSessionNotes,
  updateUniversitySession,
  updateUniversitySemester,
  upsertUniversityAttendance,
  upsertUniversityConfig,
} from "./api";
import { useUniversityWorkspaceStore } from "./store";
import { UNIVERSITY_WORKSPACE_MOCK_STATE } from "./mock-data";
import type { Assignment, AssignmentStatus, ClassSession, Semester, UniversityWorkspaceState } from "./types";

function sortAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((a, b) => {
    const byDeadline = String(a.deadline).localeCompare(String(b.deadline));
    if (byDeadline !== 0) return byDeadline;
    return a.id.localeCompare(b.id);
  });
}

function countPendingAssignments(assignments: Assignment[]): number {
  return assignments.filter((a) => a.status !== "done" && a.status !== "submitted").length;
}

export function useStudyUniversity(workspaceId: string, token: string | null) {
  const {
    state,
    setState,
    patchState,
    selectedSessionId,
    setSelectedSessionId,
    onboardingOpen,
    setOnboardingOpen,
    createCourseOpen,
    setCreateCourseOpen,
  } = useUniversityWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertAssignmentInState = useCallback(
    (assignment: Assignment) => {
      patchState((prev) => {
        const assignments = sortAssignments([
          ...prev.assignments.filter((a) => a.id !== assignment.id),
          assignment,
        ]);
        return {
          ...prev,
          assignments,
          stats: {
            ...prev.stats,
            pendingAssignments: countPendingAssignments(assignments),
          },
        };
      });
    },
    [patchState],
  );

  const removeAssignmentFromState = useCallback(
    (assignmentId: string) => {
      patchState((prev) => {
        const assignments = prev.assignments.filter((a) => a.id !== assignmentId);
        return {
          ...prev,
          assignments,
          stats: {
            ...prev.stats,
            pendingAssignments: countPendingAssignments(assignments),
          },
        };
      });
    },
    [patchState],
  );

  const patchSessionInState = useCallback(
    (sessionId: string, patch: Partial<ClassSession>) => {
      patchState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((session) =>
          session.id === sessionId ? { ...session, ...patch } : session,
        ),
      }));
    },
    [patchState],
  );

  const load = useCallback(async () => {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUniversityWorkspaceState(token, workspaceId);
      setState(data);
      if (!data.config?.onboardingCompleted) setOnboardingOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error loading study workspace";
      setError(message);
      // Do not open onboarding for "Workspace not found" — workspace does not exist.
      const isNotFound = /workspace not found/i.test(message);
      if (!isNotFound) {
        setState({
          ...UNIVERSITY_WORKSPACE_MOCK_STATE,
          stats: {
            ...UNIVERSITY_WORKSPACE_MOCK_STATE.stats,
          },
        });
        setOnboardingOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, setState, setOnboardingOpen]);

  const upsertConfig = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      await upsertUniversityConfig(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const createSemester = useCallback(
    async (payload: Record<string, unknown>): Promise<Semester | undefined> => {
      if (!token) return undefined;
      const semester = await createUniversitySemester(token, workspaceId, payload);
      await load();
      return semester;
    },
    [token, workspaceId, load],
  );

  const updateSemester = useCallback(
    async (semesterId: string, payload: Record<string, unknown>) => {
      if (!token) return;
      await updateUniversitySemester(token, workspaceId, semesterId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const createCourse = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      await createUniversityCourse(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const reorderCourses = useCallback(
    async (orderedCourseIds: string[]) => {
      if (!token) return;
      const courses = await reorderUniversityCourses(token, workspaceId, orderedCourseIds);
      setState({
        ...state,
        courses,
      });
    },
    [token, workspaceId, setState, state],
  );

  const generateSessions = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      await generateUniversitySessions(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const createAssignment = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      const assignment = await createUniversityAssignment(token, workspaceId, payload);
      upsertAssignmentInState(assignment);
      return assignment;
    },
    [token, workspaceId, upsertAssignmentInState],
  );

  const updateAssignment = useCallback(
    async (assignmentId: string, payload: Record<string, unknown>) => {
      if (!token) return;
      const assignment = await updateUniversityAssignment(token, workspaceId, assignmentId, payload);
      upsertAssignmentInState(assignment);
      return assignment;
    },
    [token, workspaceId, upsertAssignmentInState],
  );

  const deleteAssignment = useCallback(
    async (assignmentId: string) => {
      if (!token) return;
      await deleteUniversityAssignment(token, workspaceId, assignmentId);
      removeAssignmentFromState(assignmentId);
    },
    [token, workspaceId, removeAssignmentFromState],
  );

  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, status: AssignmentStatus) => {
      if (!token) return;
      const assignment = await updateUniversityAssignmentStatus(token, workspaceId, assignmentId, status);
      upsertAssignmentInState(assignment);
      return assignment;
    },
    [token, workspaceId, upsertAssignmentInState],
  );

  const updateSession = useCallback(
    async (
      sessionId: string,
      payload: { sessionDate?: string; startTime?: string; endTime?: string; classroom?: string },
    ) => {
      if (!token) return;
      await updateUniversitySession(token, workspaceId, sessionId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const updateSessionNotes = useCallback(
    async (
      sessionId: string,
      payload: { notesHtml?: string; notesJson?: Record<string, unknown>; aiSummaryMock?: string },
    ) => {
      if (!token) return;
      await updateUniversityClassSessionNotes(token, workspaceId, sessionId, payload);
      const hasNotes = Boolean(
        (payload.notesHtml && payload.notesHtml.trim().length > 0) ||
          payload.notesJson ||
          (payload.aiSummaryMock && payload.aiSummaryMock.trim().length > 0),
      );
      patchSessionInState(sessionId, {
        hasNotes,
        notesHtml: payload.notesHtml ?? null,
        notesJson: payload.notesJson ?? null,
        aiSummaryMock: payload.aiSummaryMock ?? null,
      });
    },
    [token, workspaceId, patchSessionInState],
  );

  const setAttendance = useCallback(
    async (payload: { classSessionId: string; courseId: string; status: "present" | "late" | "absent" | "justified"; note?: string }) => {
      if (!token) return;
      await upsertUniversityAttendance(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const createGrade = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      await createUniversityGradeItem(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const updateGrade = useCallback(
    async (gradeItemId: string, payload: Record<string, unknown>) => {
      if (!token) return;
      await updateUniversityGradeItem(token, workspaceId, gradeItemId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const deleteGrade = useCallback(
    async (gradeItemId: string) => {
      if (!token) return;
      await deleteUniversityGradeItem(token, workspaceId, gradeItemId);
      await load();
    },
    [token, workspaceId, load],
  );

  const createExam = useCallback(
    async (payload: {
      courseId: string;
      name: string;
      gradeDate: string;
      weight?: number;
      score?: number;
      maxScore?: number;
    }) => {
      if (!token) return;
      await createUniversityGradeItem(token, workspaceId, {
        ...payload,
        type: "exam",
        weight: payload.weight ?? 0,
      });
      await load();
    },
    [token, workspaceId, load],
  );

  const updateExam = useCallback(
    async (
      gradeItemId: string,
      payload: {
        name?: string;
        gradeDate?: string;
        weight?: number;
        score?: number;
        maxScore?: number;
      },
    ) => {
      if (!token) return;
      await updateUniversityGradeItem(token, workspaceId, gradeItemId, {
        ...payload,
        type: "exam",
      });
      await load();
    },
    [token, workspaceId, load],
  );

  const deleteExam = useCallback(
    async (gradeItemId: string) => {
      if (!token) return;
      await deleteUniversityGradeItem(token, workspaceId, gradeItemId);
      await load();
    },
    [token, workspaceId, load],
  );

  const startFocus = useCallback(
    async (durationMinutes: number, courseId?: string) => {
      if (!token) return;
      await startUniversityFocusSession(token, workspaceId, { durationMinutes, courseId });
      await load();
    },
    [token, workspaceId, load],
  );

  const completeFocus = useCallback(
    async (focusSessionId: string) => {
      if (!token) return;
      await completeUniversityFocusSession(token, workspaceId, focusSessionId);
      await load();
    },
    [token, workspaceId, load],
  );

  const selectedSession = useMemo(
    () => state.sessions.find((session) => session.id === selectedSessionId) ?? null,
    [state.sessions, selectedSessionId],
  );

  return {
    state: state as UniversityWorkspaceState,
    loading,
    error,
    selectedSessionId,
    selectedSession,
    onboardingOpen,
    createCourseOpen,
    setSelectedSessionId,
    setOnboardingOpen,
    setCreateCourseOpen,
    load,
    upsertAssignmentInState,
    removeAssignmentFromState,
    patchSessionInState,
    upsertConfig,
    createSemester,
    updateSemester,
    createCourse,
    reorderCourses,
    generateSessions,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    updateAssignmentStatus,
    updateSession,
    updateSessionNotes,
    setAttendance,
    createGrade,
    updateGrade,
    deleteGrade,
    createExam,
    updateExam,
    deleteExam,
    startFocus,
    completeFocus,
  };
}
