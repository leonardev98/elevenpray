"use client";

import { useEffect, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCourseClasses } from "./course-detail-rich-mocks";
import type { MockCourseClassSession } from "./course-detail-rich-mocks";

export type ClassAttachmentType = "pdf" | "image" | "other";

export type ClassAttachment = {
  id: string;
  name: string;
  type: ClassAttachmentType;
  size: string;
  uploadedAt: number;
  /** URL local creada con URL.createObjectURL (no persistida en producción — se pierde al recargar). */
  previewUrl?: string | null;
};

export type CourseClass = {
  id: string;
  courseId: string;
  number: number;
  title: string;
  dateLine: string;
  /** Fecha ISO seleccionable. */
  dateIso?: string | null;
  timeRange: string;
  unitLabel: string | null;
  contentJson: JSONContent | null;
  attachments: ClassAttachment[];
  linkedTaskId: string | null;
  completed: boolean;
  status: "draft" | "completed";
  notesCount: number;
  flashcardsCount: number;
  linkedNoteTitles: string[];
  createdAt: number;
  updatedAt: number;
};

interface CourseClassesState {
  classes: Record<string, CourseClass>;
  seededCourses: Record<string, true>;
  ensureSeed: (courseId: string) => void;
  createClass: (courseId: string, init?: Partial<Omit<CourseClass, "id" | "courseId" | "createdAt" | "updatedAt">>) => CourseClass;
  updateClass: (classId: string, patch: Partial<Omit<CourseClass, "id" | "courseId" | "createdAt">>) => void;
  deleteClass: (classId: string) => void;
  addAttachment: (classId: string, attachment: Omit<ClassAttachment, "id" | "uploadedAt">) => void;
  removeAttachment: (classId: string, attachmentId: string) => void;
  setLinkedTask: (classId: string, taskId: string | null) => void;
}

function nowMs(): number {
  return Date.now();
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function classFromMock(courseId: string, mock: MockCourseClassSession): CourseClass {
  const text = mock.linkedNoteTitles.join("\n");
  const content: JSONContent = {
    type: "doc",
    content: text
      ? [
          { type: "paragraph", content: [{ type: "text", text: `Apuntes vinculados a esta sesión:` }] },
          ...mock.linkedNoteTitles.map((t) => ({
            type: "paragraph" as const,
            content: [{ type: "text" as const, text: `• ${t}` }],
          })),
        ]
      : [{ type: "paragraph" }],
  };
  return {
    id: `${courseId}__${mock.id}`,
    courseId,
    number: mock.number,
    title: mock.title,
    dateLine: mock.dateLine,
    dateIso: null,
    timeRange: mock.timeRange,
    unitLabel: null,
    contentJson: content,
    attachments: [],
    linkedTaskId: null,
    completed: mock.completed,
    status: mock.completed ? "completed" : "draft",
    notesCount: mock.notesCount,
    flashcardsCount: mock.flashcardsCount,
    linkedNoteTitles: mock.linkedNoteTitles,
    createdAt: nowMs(),
    updatedAt: nowMs(),
  };
}

export const useCourseClassesStore = create<CourseClassesState>()(
  persist(
    (set, get) => ({
      classes: {},
      seededCourses: {},
      ensureSeed: (courseId: string) => {
        if (get().seededCourses[courseId]) return;
        const mocks = getCourseClasses(courseId);
        if (mocks.length === 0) {
          set((state) => ({ seededCourses: { ...state.seededCourses, [courseId]: true } }));
          return;
        }
        const next: Record<string, CourseClass> = { ...get().classes };
        for (const m of mocks) {
          const c = classFromMock(courseId, m);
          next[c.id] = c;
        }
        set({
          classes: next,
          seededCourses: { ...get().seededCourses, [courseId]: true },
        });
      },
      createClass: (courseId, init) => {
        const id = uid("cls");
        const existingForCourse = Object.values(get().classes).filter((c) => c.courseId === courseId);
        const nextNumber = init?.number ?? existingForCourse.length + 1;
        const cls: CourseClass = {
          id,
          courseId,
          number: nextNumber,
          title: init?.title ?? `Clase ${nextNumber}`,
          dateLine: init?.dateLine ?? "Sin fecha",
          dateIso: init?.dateIso ?? null,
          timeRange: init?.timeRange ?? "—",
          unitLabel: init?.unitLabel ?? null,
          contentJson: init?.contentJson ?? { type: "doc", content: [{ type: "paragraph" }] },
          attachments: init?.attachments ?? [],
          linkedTaskId: init?.linkedTaskId ?? null,
          completed: init?.completed ?? false,
          status: init?.status ?? "draft",
          notesCount: init?.notesCount ?? 0,
          flashcardsCount: init?.flashcardsCount ?? 0,
          linkedNoteTitles: init?.linkedNoteTitles ?? [],
          createdAt: nowMs(),
          updatedAt: nowMs(),
        };
        set((state) => ({ classes: { ...state.classes, [id]: cls } }));
        return cls;
      },
      updateClass: (classId, patch) => {
        set((state) => {
          const current = state.classes[classId];
          if (!current) return state;
          const updated: CourseClass = { ...current, ...patch, updatedAt: nowMs() };
          return { classes: { ...state.classes, [classId]: updated } };
        });
      },
      deleteClass: (classId) => {
        set((state) => {
          if (!state.classes[classId]) return state;
          const rest = { ...state.classes };
          delete rest[classId];
          return { classes: rest };
        });
      },
      addAttachment: (classId, attachment) => {
        set((state) => {
          const current = state.classes[classId];
          if (!current) return state;
          const att: ClassAttachment = {
            ...attachment,
            id: uid("att"),
            uploadedAt: nowMs(),
          };
          const updated: CourseClass = {
            ...current,
            attachments: [att, ...current.attachments],
            updatedAt: nowMs(),
          };
          return { classes: { ...state.classes, [classId]: updated } };
        });
      },
      removeAttachment: (classId, attachmentId) => {
        set((state) => {
          const current = state.classes[classId];
          if (!current) return state;
          const updated: CourseClass = {
            ...current,
            attachments: current.attachments.filter((a) => a.id !== attachmentId),
            updatedAt: nowMs(),
          };
          return { classes: { ...state.classes, [classId]: updated } };
        });
      },
      setLinkedTask: (classId, taskId) => {
        set((state) => {
          const current = state.classes[classId];
          if (!current) return state;
          return {
            classes: { ...state.classes, [classId]: { ...current, linkedTaskId: taskId, updatedAt: nowMs() } },
          };
        });
      },
    }),
    {
      name: "mitsyy_course_classes_v1",
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
      partialize: (state) => ({ classes: state.classes, seededCourses: state.seededCourses }),
    },
  ),
);

export function useCourseClasses(courseId: string): CourseClass[] {
  const [hydrated, setHydrated] = useState(false);
  const ensureSeed = useCourseClassesStore((s) => s.ensureSeed);
  const allClasses = useCourseClassesStore((s) => s.classes);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratación SSR del store persistido
    setHydrated(true);
    ensureSeed(courseId);
  }, [courseId, ensureSeed]);

  if (!hydrated) return [];

  return Object.values(allClasses)
    .filter((c) => c.courseId === courseId)
    .sort((a, b) => b.number - a.number);
}
