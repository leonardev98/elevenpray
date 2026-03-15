"use client";

import { useCallback, useMemo, useState } from "react";
import {
  completeUniversityFocusSession,
  createUniversityAssignment,
  createUniversityCourse,
  createUniversityGradeItem,
  createUniversitySemester,
  generateUniversitySessions,
  getUniversityWorkspaceState,
  reorderUniversityCourses,
  startUniversityFocusSession,
  updateUniversityAssignmentStatus,
  updateUniversityClassSessionNotes,
  upsertUniversityAttendance,
  upsertUniversityConfig,
} from "./api";
import { useUniversityWorkspaceStore } from "./store";
import { UNIVERSITY_WORKSPACE_MOCK_STATE } from "./mock-data";
import type { AssignmentStatus, UniversityWorkspaceState } from "./types";

export function useStudyUniversity(workspaceId: string, token: string | null) {
  const {
    state,
    setState,
    selectedSessionId,
    setSelectedSessionId,
    onboardingOpen,
    setOnboardingOpen,
    createCourseOpen,
    setCreateCourseOpen,
  } = useUniversityWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUniversityWorkspaceState(token, workspaceId);
      setState(data);
      if (!data.config?.onboardingCompleted) setOnboardingOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading study workspace");
      // Mock fallback keeps the UI usable when backend data is not ready yet.
      setState({
        ...UNIVERSITY_WORKSPACE_MOCK_STATE,
        stats: {
          ...UNIVERSITY_WORKSPACE_MOCK_STATE.stats,
        },
      });
      setOnboardingOpen(true);
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
    async (payload: Record<string, unknown>) => {
      if (!token) return;
      await createUniversitySemester(token, workspaceId, payload);
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
      await createUniversityAssignment(token, workspaceId, payload);
      await load();
    },
    [token, workspaceId, load],
  );

  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, status: AssignmentStatus) => {
      if (!token) return;
      await updateUniversityAssignmentStatus(token, workspaceId, assignmentId, status);
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
      await load();
    },
    [token, workspaceId, load],
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
    upsertConfig,
    createSemester,
    createCourse,
    reorderCourses,
    generateSessions,
    createAssignment,
    updateAssignmentStatus,
    updateSessionNotes,
    setAttendance,
    createGrade,
    startFocus,
    completeFocus,
  };
}
