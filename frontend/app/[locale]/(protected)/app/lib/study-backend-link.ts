"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  createUniversityClassSession,
  createUniversityCourse,
  updateUniversityClassSessionMetadata,
} from "@/app/lib/study-university/api";
import { getWorkspaces, createWorkspace } from "@/app/lib/workspaces-api";
import type { MockCourseExtended } from "./mock-course-data";
import type { CourseClass } from "./course-classes-store";

/**
 * Mapa local → backend para flashcards/quizzes.
 *
 * El detalle de cursos vive en localStorage (legacy), pero las flashcards y
 * quizzes se persisten en backend, que requiere `course_id` y
 * `class_session_id` reales (UUID). Este store mantiene el mapeo, lo crea
 * en backend bajo demanda y lo cachea en localStorage.
 */

interface StudyBackendLinkState {
  workspaceId: string | null;
  courseMap: Record<string, string>;
  classMap: Record<string, string>;
  setWorkspaceId: (id: string | null) => void;
  setCourseMap: (localId: string, serverId: string) => void;
  setClassMap: (localId: string, serverId: string) => void;
  clearCourse: (localId: string) => void;
  clearClassSession: (localId: string) => void;
  clearClassSessionsByCourse: (localCourseIds: string[]) => void;
  reset: () => void;
}

type ColorToken =
  | "blue"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "teal";

const ACCENT_TO_COLOR_TOKEN: Record<string, ColorToken> = {
  teal: "teal",
  violet: "violet",
  amber: "amber",
  rose: "rose",
  sky: "cyan",
  emerald: "emerald",
};

export const useStudyBackendLinkStore = create<StudyBackendLinkState>()(
  persist(
    (set) => ({
      workspaceId: null,
      courseMap: {},
      classMap: {},
      setWorkspaceId: (id) => set({ workspaceId: id }),
      setCourseMap: (localId, serverId) =>
        set((state) => ({ courseMap: { ...state.courseMap, [localId]: serverId } })),
      setClassMap: (localId, serverId) =>
        set((state) => ({ classMap: { ...state.classMap, [localId]: serverId } })),
      clearCourse: (localId) =>
        set((state) => {
          if (!(localId in state.courseMap)) return state;
          const next = { ...state.courseMap };
          delete next[localId];
          return { courseMap: next };
        }),
      clearClassSession: (localId) =>
        set((state) => {
          if (!(localId in state.classMap)) return state;
          const next = { ...state.classMap };
          delete next[localId];
          return { classMap: next };
        }),
      clearClassSessionsByCourse: (localCourseIds) =>
        set((state) => {
          if (localCourseIds.length === 0) return state;
          const ids = new Set(localCourseIds);
          const next: Record<string, string> = {};
          for (const [k, v] of Object.entries(state.classMap)) {
            if (!ids.has(k)) next[k] = v;
          }
          return { classMap: next };
        }),
      reset: () => set({ workspaceId: null, courseMap: {}, classMap: {} }),
    }),
    {
      name: "mitsyy_study_backend_link_v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      version: 1,
    },
  ),
);

function pickAccent(course: MockCourseExtended): ColorToken {
  const accent = (course as MockCourseExtended & { accent?: string }).accent;
  if (accent && ACCENT_TO_COLOR_TOKEN[accent]) return ACCENT_TO_COLOR_TOKEN[accent];
  return "violet";
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Extrae un par `HH:MM` desde un texto libre de horario (p.ej. "8:00 - 10:00",
 * "8:00-10:00", "08:00", "Por definir", "—"). Si el formato no es reconocible,
 * cae a valores por defecto razonables para no romper la creación de sesiones
 * en backend (la BD exige `time`).
 */
function parseTimeRange(raw: string | null | undefined): {
  startTime: string;
  endTime: string;
} {
  const DEFAULT_START = "08:00";
  const DEFAULT_END = "09:00";
  if (!raw || typeof raw !== "string") {
    return { startTime: DEFAULT_START, endTime: DEFAULT_END };
  }
  // Capturamos hasta dos ocurrencias de H:MM o HH:MM en el texto.
  const matches = raw.match(/\b(\d{1,2}):(\d{2})\b/g);
  if (!matches || matches.length === 0) {
    return { startTime: DEFAULT_START, endTime: DEFAULT_END };
  }
  const normalize = (s: string): string | null => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(s);
    if (!m) return null;
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  const startTime = normalize(matches[0]) ?? DEFAULT_START;
  let endTime = matches[1] ? normalize(matches[1]) ?? DEFAULT_END : DEFAULT_END;
  // Garantizamos `startTime < endTime` (el backend lo valida).
  if (endTime <= startTime) {
    const [sh, sm] = startTime.split(":").map(Number);
    const total = sh * 60 + sm + 60;
    if (total >= 24 * 60) {
      endTime = "23:59";
    } else {
      const nh = Math.floor(total / 60);
      const nm = total % 60;
      endTime = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
    }
  }
  return { startTime, endTime };
}

/**
 * Hook reactivo: asegura un workspace de tipo `study` y expone funciones para
 * traducir entre IDs locales y de backend.
 */
export function useStudyBackendLink(token: string | null) {
  const workspaceId = useStudyBackendLinkStore((s) => s.workspaceId);
  const courseMap = useStudyBackendLinkStore((s) => s.courseMap);
  const classMap = useStudyBackendLinkStore((s) => s.classMap);
  const setWorkspaceId = useStudyBackendLinkStore((s) => s.setWorkspaceId);
  const setCourseMap = useStudyBackendLinkStore((s) => s.setCourseMap);
  const setClassMap = useStudyBackendLinkStore((s) => s.setClassMap);
  const clearCourseFromStore = useStudyBackendLinkStore((s) => s.clearCourse);
  const clearClassSessionFromStore = useStudyBackendLinkStore((s) => s.clearClassSession);

  const [error, setError] = useState<string | null>(null);
  const [ensuringWorkspace, setEnsuringWorkspace] = useState(false);

  // Deduplicamos llamadas concurrentes (p. ej. `useEffect` + `handleCreate`
  // disparados a la vez) compartiendo la misma Promise en vuelo. Las refs no
  // disparan re-renders, así que es ideal para esto.
  const inflightCourseRef = useRef(new Map<string, Promise<string | null>>());
  const inflightSessionRef = useRef(new Map<string, Promise<string | null>>());

  const ensureWorkspace = useCallback(
    async (opts?: { force?: boolean }): Promise<string | null> => {
      if (!token) return null;
      setEnsuringWorkspace(true);
      setError(null);
      try {
        const all = await getWorkspaces(token);

        if (!opts?.force && workspaceId) {
          const cachedStillValid = all.some((w) => w.id === workspaceId);
          if (cachedStillValid) return workspaceId;
          // UUID en localStorage ya no existe (BD reseteada, otro entorno, etc.)
          useStudyBackendLinkStore.getState().reset();
        }

        const study = all.find(
          (w) => w.workspaceType === "study" || w.workspaceType === "university",
        );
        if (study) {
          setWorkspaceId(study.id);
          return study.id;
        }
        const created = await createWorkspace(token, "Estudios", "study");
        setWorkspaceId(created.id);
        return created.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al obtener workspace";
        setError(message);
        return null;
      } finally {
        setEnsuringWorkspace(false);
      }
    },
    [token, workspaceId, setWorkspaceId],
  );

  const ensureCourse = useCallback(
    async (
      course: MockCourseExtended,
      opts?: { force?: boolean },
    ): Promise<string | null> => {
      if (!token) return null;
      if (!opts?.force) {
        const cached = courseMap[course.id];
        if (cached) return cached;
        const inflight = inflightCourseRef.current.get(course.id);
        if (inflight) return inflight;
      }
      const promise = (async (): Promise<string | null> => {
        const ws = await ensureWorkspace();
        if (!ws) return null;
        try {
          const { course: created } = await createUniversityCourse(token, ws, {
            name: course.name,
            code: course.code ?? undefined,
            colorToken: pickAccent(course),
            schedules: [],
          });
          setCourseMap(course.id, created.id);
          return created.id;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error al sincronizar curso";
          setError(message);
          return null;
        }
      })();
      inflightCourseRef.current.set(course.id, promise);
      try {
        return await promise;
      } finally {
        inflightCourseRef.current.delete(course.id);
      }
    },
    [token, courseMap, ensureWorkspace, setCourseMap],
  );

  const ensureClassSession = useCallback(
    async (
      course: MockCourseExtended,
      cls: CourseClass,
      opts?: { force?: boolean },
    ): Promise<string | null> => {
      if (!token) return null;
      if (!opts?.force) {
        const cached = classMap[cls.id];
        if (cached) return cached;
        const inflight = inflightSessionRef.current.get(cls.id);
        if (inflight) return inflight;
      }
      const promise = (async (): Promise<string | null> => {
        const ws = await ensureWorkspace();
        if (!ws) return null;
        const courseServerId = await ensureCourse(course, { force: opts?.force });
        if (!courseServerId) return null;
        try {
          const sessionDate = cls.dateIso ?? todayIso();
          const { startTime, endTime } = parseTimeRange(cls.timeRange);
          const created = await createUniversityClassSession(token, ws, {
            courseId: courseServerId,
            sessionDate,
            startTime,
            endTime,
            title: cls.title,
            classNumber: cls.number,
            unitLabel: cls.unitLabel ?? null,
          });
          setClassMap(cls.id, created.id);
          return created.id;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Error al sincronizar clase con backend";
          setError(message);
          return null;
        }
      })();
      inflightSessionRef.current.set(cls.id, promise);
      try {
        return await promise;
      } finally {
        inflightSessionRef.current.delete(cls.id);
      }
    },
    [token, classMap, ensureWorkspace, ensureCourse, setClassMap],
  );

  /**
   * Invalida el mapeo local→servidor de un curso (y de sus clases en cache) y
   * fuerza la recreación remota. Se usa cuando el backend responde "Course
   * not found" porque el UUID cacheado ya no es válido (BD reseteada, cuenta
   * distinta, curso eliminado en otro dispositivo, etc.).
   */
  const refreshCourseMapping = useCallback(
    async (course: MockCourseExtended): Promise<string | null> => {
      clearCourseFromStore(course.id);
      return ensureCourse(course, { force: true });
    },
    [clearCourseFromStore, ensureCourse],
  );

  /**
   * Recrea el mapeo local→servidor tanto del curso como de la clase. Devuelve
   * los nuevos IDs de servidor para que el llamador pueda reintentar la
   * operación sin esperar al ciclo de re-render del store.
   */
  const refreshClassSessionMapping = useCallback(
    async (
      course: MockCourseExtended,
      cls: CourseClass,
    ): Promise<{ courseId: string | null; classSessionId: string | null }> => {
      clearCourseFromStore(course.id);
      clearClassSessionFromStore(cls.id);
      const newCourseId = await ensureCourse(course, { force: true });
      if (!newCourseId) {
        return { courseId: null, classSessionId: null };
      }
      const newSessionId = await ensureClassSession(course, cls, { force: true });
      return { courseId: newCourseId, classSessionId: newSessionId };
    },
    [clearCourseFromStore, clearClassSessionFromStore, ensureCourse, ensureClassSession],
  );

  const syncClassMetadata = useCallback(
    async (cls: CourseClass) => {
      if (!token) return;
      const ws = workspaceId;
      const serverSessionId = classMap[cls.id];
      if (!ws || !serverSessionId) return;
      try {
        const sessionDate = cls.dateIso ?? todayIso();
        const { startTime, endTime } = parseTimeRange(cls.timeRange);
        await updateUniversityClassSessionMetadata(token, ws, serverSessionId, {
          title: cls.title,
          classNumber: cls.number,
          unitLabel: cls.unitLabel,
          sessionDate,
          startTime,
          endTime,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al sincronizar metadata";
        setError(message);
      }
    },
    [token, workspaceId, classMap],
  );

  useEffect(() => {
    if (token && !workspaceId && !ensuringWorkspace) {
      void ensureWorkspace();
    }
  }, [token, workspaceId, ensuringWorkspace, ensureWorkspace]);

  return {
    workspaceId,
    courseMap,
    classMap,
    error,
    ensuringWorkspace,
    ensureWorkspace,
    ensureCourse,
    ensureClassSession,
    syncClassMetadata,
    refreshCourseMapping,
    refreshClassSessionMapping,
  };
}
