"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCourseFlashcard,
  deleteCourseFlashcard,
  listCourseFlashcards,
} from "@/app/lib/study-university/api";
import type { CourseFlashcard } from "@/app/lib/study-university/types";

/**
 * Resultado de un intento de recuperación cuando el backend responde con
 * "Course not found" / "Class session not found". Devuelve los IDs frescos
 * que se usarán para reintentar la operación; si la recuperación falla,
 * devolver `null` o lanzar.
 */
export interface MissingMappingRecovery {
  courseId: string | null;
  classSessionId?: string | null;
}

interface UseCourseFlashcardsOptions {
  /**
   * Callback opcional invocado cuando el backend devuelve "Course not found"
   * o "Class session not found" al crear una flashcard. Debe limpiar el
   * mapeo local cacheado y recrearlo en backend, devolviendo los nuevos IDs
   * o `null` si no es posible recuperarse.
   */
  onMissingMapping?: (info: {
    kind: "course" | "class_session";
    classSessionId: string | null;
  }) => Promise<MissingMappingRecovery | null>;
}

function isMissingCourseError(err: unknown): boolean {
  return err instanceof Error && /course not found/i.test(err.message);
}

function isMissingClassSessionError(err: unknown): boolean {
  return err instanceof Error && /class session not found/i.test(err.message);
}

/**
 * Hook que carga flashcards del backend para un curso.
 *
 * Si todavía no hay enlace al backend (token o serverCourseId nulos), opera
 * en modo offline: las flashcards solo se mantienen en memoria local.
 */
export function useCourseFlashcards(
  token: string | null,
  workspaceId: string | null,
  serverCourseId: string | null,
  options?: UseCourseFlashcardsOptions,
) {
  const [items, setItems] = useState<CourseFlashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onMissingMapping = options?.onMissingMapping;

  const load = useCallback(async () => {
    if (!token || !workspaceId || !serverCourseId) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listCourseFlashcards(token, workspaceId, serverCourseId);
      setItems(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar flashcards";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, serverCourseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (payload: {
      question: string;
      answer: string;
      hint?: string;
      classSessionId?: string;
    }) => {
      if (!token || !workspaceId || !serverCourseId) {
        const local: CourseFlashcard = {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          courseId: serverCourseId ?? "",
          workspaceId: workspaceId ?? "",
          classSessionId: payload.classSessionId ?? null,
          classNumber: null,
          classTitle: null,
          question: payload.question,
          answer: payload.answer,
          hint: payload.hint ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setItems((prev) => [local, ...prev]);
        return local;
      }
      try {
        const created = await createCourseFlashcard(
          token,
          workspaceId,
          serverCourseId,
          payload,
        );
        setItems((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        const missingCourse = isMissingCourseError(err);
        const missingSession = isMissingClassSessionError(err);
        if (!onMissingMapping || (!missingCourse && !missingSession)) {
          throw err;
        }
        const recovery = await onMissingMapping({
          kind: missingCourse ? "course" : "class_session",
          classSessionId: payload.classSessionId ?? null,
        });
        if (!recovery || !recovery.courseId) {
          throw err;
        }
        const retryPayload = {
          ...payload,
          classSessionId:
            recovery.classSessionId === undefined
              ? payload.classSessionId
              : recovery.classSessionId ?? undefined,
        };
        const created = await createCourseFlashcard(
          token,
          workspaceId,
          recovery.courseId,
          retryPayload,
        );
        setItems((prev) => [created, ...prev]);
        return created;
      }
    },
    [token, workspaceId, serverCourseId, onMissingMapping],
  );

  const remove = useCallback(
    async (id: string) => {
      if (token && workspaceId) {
        try {
          await deleteCourseFlashcard(token, workspaceId, id);
        } catch (err) {
          if (!id.startsWith("local_")) throw err;
        }
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
    },
    [token, workspaceId],
  );

  return { items, loading, error, reload: load, create, remove };
}
