"use client";

import { useEffect, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCourseNotes, type MockCourseNote } from "./mock-course-data";

export type CourseNoteIcon =
  | "book"
  | "lightbulb"
  | "pin"
  | "target"
  | "sparkles"
  | "flask";

export type CourseNote = {
  id: string;
  courseId: string;
  title: string;
  contentJson: JSONContent | null;
  /** Texto plano para preview en la lista (derivado del JSON). */
  preview: string;
  /** Aprox: minutos de lectura calculado a partir del texto plano. */
  readMinutes: number;
  /** Acento opcional asignado por el alumno. */
  colorAccent: string | null;
  icon: CourseNoteIcon;
  classLabel: string | null;
  createdAt: number;
  updatedAt: number;
};

interface CourseNotesState {
  /** Notas indexadas por id. */
  notes: Record<string, CourseNote>;
  /** Cursos cuya semilla ya fue importada desde los mocks (para no duplicar). */
  seededCourses: Record<string, true>;
  ensureSeed: (courseId: string) => void;
  createNote: (courseId: string, init?: Partial<Omit<CourseNote, "id" | "courseId" | "createdAt" | "updatedAt">>) => CourseNote;
  updateNote: (noteId: string, patch: Partial<Omit<CourseNote, "id" | "courseId" | "createdAt">>) => void;
  deleteNote: (noteId: string) => void;
  duplicateNote: (noteId: string) => CourseNote | null;
}

function nowMs(): number {
  return Date.now();
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function paragraphsFromText(text: string): JSONContent {
  const blocks = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length === 0) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  return {
    type: "doc",
    content: blocks.map((p) => ({
      type: "paragraph",
      content: p
        .split("\n")
        .map((line, i, arr) => {
          const nodes: JSONContent[] = [{ type: "text", text: line }];
          if (i < arr.length - 1) nodes.push({ type: "hardBreak" });
          return nodes;
        })
        .flat(),
    })),
  };
}

export function plainTextFromJson(doc: JSONContent | null | undefined): string {
  if (!doc) return "";
  let out = "";
  function walk(node: JSONContent): void {
    if (node.type === "text" && typeof node.text === "string") {
      out += node.text;
      return;
    }
    if (node.type === "hardBreak") {
      out += " ";
      return;
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
      if (
        node.type === "paragraph" ||
        node.type === "heading" ||
        node.type === "listItem" ||
        node.type === "taskItem" ||
        node.type === "blockquote" ||
        node.type === "callout"
      ) {
        out += "\n";
      }
    }
  }
  walk(doc);
  return out.replace(/\n{2,}/g, "\n").trim();
}

export function readMinutesFromText(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function noteFromMock(courseId: string, mock: MockCourseNote): CourseNote {
  const content = paragraphsFromText(mock.body || mock.preview || "");
  const preview = plainTextFromJson(content).slice(0, 240);
  return {
    id: `${courseId}__${mock.id}`,
    courseId,
    title: mock.title,
    contentJson: content,
    preview,
    readMinutes: mock.readMinutes ?? readMinutesFromText(plainTextFromJson(content)),
    colorAccent: null,
    icon: "book",
    classLabel: mock.classLabel ?? null,
    createdAt: nowMs(),
    updatedAt: nowMs(),
  };
}

export const useCourseNotesStore = create<CourseNotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      seededCourses: {},
      ensureSeed: (courseId: string) => {
        if (get().seededCourses[courseId]) return;
        const mocks = getCourseNotes(courseId);
        if (mocks.length === 0) {
          set((state) => ({ seededCourses: { ...state.seededCourses, [courseId]: true } }));
          return;
        }
        const newNotes: Record<string, CourseNote> = { ...get().notes };
        for (const mock of mocks) {
          const note = noteFromMock(courseId, mock);
          newNotes[note.id] = note;
        }
        set({
          notes: newNotes,
          seededCourses: { ...get().seededCourses, [courseId]: true },
        });
      },
      createNote: (courseId, init) => {
        const id = uid("note");
        const initialContent: JSONContent = init?.contentJson ?? {
          type: "doc",
          content: [{ type: "paragraph" }],
        };
        const text = plainTextFromJson(initialContent);
        const note: CourseNote = {
          id,
          courseId,
          title: init?.title ?? "Nota sin título",
          contentJson: initialContent,
          preview: init?.preview ?? text.slice(0, 240),
          readMinutes: init?.readMinutes ?? readMinutesFromText(text),
          colorAccent: init?.colorAccent ?? null,
          icon: init?.icon ?? "book",
          classLabel: init?.classLabel ?? null,
          createdAt: nowMs(),
          updatedAt: nowMs(),
        };
        set((state) => ({ notes: { ...state.notes, [id]: note } }));
        return note;
      },
      updateNote: (noteId, patch) => {
        set((state) => {
          const current = state.notes[noteId];
          if (!current) return state;
          let preview = current.preview;
          let readMinutes = current.readMinutes;
          if (patch.contentJson) {
            const text = plainTextFromJson(patch.contentJson);
            preview = text.slice(0, 240);
            readMinutes = readMinutesFromText(text);
          }
          const updated: CourseNote = {
            ...current,
            ...patch,
            preview: patch.preview ?? preview,
            readMinutes: patch.readMinutes ?? readMinutes,
            updatedAt: nowMs(),
          };
          return { notes: { ...state.notes, [noteId]: updated } };
        });
      },
      deleteNote: (noteId) => {
        set((state) => {
          if (!state.notes[noteId]) return state;
          const rest = { ...state.notes };
          delete rest[noteId];
          return { notes: rest };
        });
      },
      duplicateNote: (noteId) => {
        const current = get().notes[noteId];
        if (!current) return null;
        const id = uid("note");
        const duped: CourseNote = {
          ...current,
          id,
          title: `${current.title} (copia)`,
          createdAt: nowMs(),
          updatedAt: nowMs(),
        };
        set((state) => ({ notes: { ...state.notes, [id]: duped } }));
        return duped;
      },
    }),
    {
      name: "mitsyy_course_notes_v1",
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
      partialize: (state) => ({ notes: state.notes, seededCourses: state.seededCourses }),
    },
  ),
);

/** Hook helper que devuelve las notas del curso (ordenadas por fecha desc) y dispara la semilla. */
export function useCourseNotes(courseId: string): CourseNote[] {
  const [hydrated, setHydrated] = useState(false);
  const ensureSeed = useCourseNotesStore((s) => s.ensureSeed);
  const allNotes = useCourseNotesStore((s) => s.notes);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratación SSR del store persistido
    setHydrated(true);
    ensureSeed(courseId);
  }, [courseId, ensureSeed]);

  if (!hydrated) return [];

  return Object.values(allNotes)
    .filter((n) => n.courseId === courseId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Formato relativo simple para mostrar "hace X". */
export function relativeTimeFromNow(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.round(diff / 1000);
  if (s < 60) return "hace unos segundos";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hace 1 día";
  if (d < 7) return `hace ${d} días`;
  const w = Math.round(d / 7);
  if (w === 1) return "hace 1 semana";
  if (w < 5) return `hace ${w} semanas`;
  const mo = Math.round(d / 30);
  if (mo === 1) return "hace 1 mes";
  return `hace ${mo} meses`;
}
