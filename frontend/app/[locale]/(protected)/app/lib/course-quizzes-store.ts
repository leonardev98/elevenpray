"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCourseQuiz,
  deleteQuiz,
  getCombinedQuizPreview,
  getQuizDetail,
  listCourseQuizzes,
  listQuizAttempts,
  createQuizAttempt as createQuizAttemptApi,
  type CreateQuizPayload,
} from "@/app/lib/study-university/api";
import type {
  CombinedQuizPreview,
  QuizAttempt,
  QuizDetail,
  QuizSummary,
} from "@/app/lib/study-university/types";

export function useCourseQuizzes(
  token: string | null,
  workspaceId: string | null,
  serverCourseId: string | null,
) {
  const [items, setItems] = useState<QuizSummary[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !workspaceId || !serverCourseId) {
      setItems([]);
      setAttempts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [quizzes, attemptsList] = await Promise.all([
        listCourseQuizzes(token, workspaceId, serverCourseId),
        listQuizAttempts(token, workspaceId, serverCourseId),
      ]);
      setItems(quizzes);
      setAttempts(attemptsList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar quizzes";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, serverCourseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (payload: CreateQuizPayload) => {
      if (!token || !workspaceId || !serverCourseId) {
        throw new Error("No hay conexión al backend para crear el quiz");
      }
      const created = await createCourseQuiz(token, workspaceId, serverCourseId, payload);
      await load();
      return created;
    },
    [token, workspaceId, serverCourseId, load],
  );

  const remove = useCallback(
    async (quizId: string) => {
      if (!token || !workspaceId) return;
      await deleteQuiz(token, workspaceId, quizId);
      setItems((prev) => prev.filter((q) => q.id !== quizId));
    },
    [token, workspaceId],
  );

  const fetchDetail = useCallback(
    async (quizId: string): Promise<QuizDetail | null> => {
      if (!token || !workspaceId) return null;
      return getQuizDetail(token, workspaceId, quizId);
    },
    [token, workspaceId],
  );

  const fetchCombined = useCallback(
    async (quizIds: string[]): Promise<CombinedQuizPreview | null> => {
      if (!token || !workspaceId || quizIds.length === 0) return null;
      return getCombinedQuizPreview(token, workspaceId, quizIds);
    },
    [token, workspaceId],
  );

  const submitAttempt = useCallback(
    async (payload: {
      sourceKind: "quiz" | "combined";
      sourceQuizIds: string[];
      classSessionIds?: string[];
      answers: Array<{
        questionId: string;
        selectedOptionId?: string;
        selectedOptionIds?: string[];
        textAnswer?: string;
      }>;
      durationSeconds?: number;
    }) => {
      if (!token || !workspaceId) return null;
      const created = await createQuizAttemptApi(token, workspaceId, payload);
      setAttempts((prev) => [created, ...prev]);
      return created;
    },
    [token, workspaceId],
  );

  return {
    items,
    attempts,
    loading,
    error,
    reload: load,
    create,
    remove,
    fetchDetail,
    fetchCombined,
    submitAttempt,
  };
}
