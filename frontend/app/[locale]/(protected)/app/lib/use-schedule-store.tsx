"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_COURSES,
  MOCK_SCHEDULE_EVENTS,
  type MockCourse,
  type MockScheduleEvent,
} from "./mock-student-data";

type AddEventInput = Omit<MockScheduleEvent, "id">;
type AddCourseInput = {
  name: string;
  code: string;
  professor?: string;
  color?: string;
  pendingTasks?: number;
};

type ScheduleStore = {
  events: MockScheduleEvent[];
  courses: MockCourse[];
  addEvent: (input: AddEventInput) => MockScheduleEvent;
  updateEvent: (id: string, patch: Partial<MockScheduleEvent>) => void;
  removeEvent: (id: string) => void;
  addCourse: (input: AddCourseInput) => MockCourse;
};

const ScheduleStoreContext = createContext<ScheduleStore | null>(null);

const COURSE_COLOR_POOL = [
  "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
];

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ScheduleStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<MockScheduleEvent[]>(MOCK_SCHEDULE_EVENTS);
  const [courses, setCourses] = useState<MockCourse[]>(MOCK_COURSES);

  const addEvent = useCallback((input: AddEventInput): MockScheduleEvent => {
    const event: MockScheduleEvent = { id: generateId("e"), ...input };
    setEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<MockScheduleEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)),
    );
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addCourse = useCallback(
    (input: AddCourseInput): MockCourse => {
      const color = input.color
        ?? COURSE_COLOR_POOL[courses.length % COURSE_COLOR_POOL.length];
      const course: MockCourse = {
        id: generateId("c"),
        name: input.name,
        code: input.code,
        color,
        professor: input.professor ?? "",
        pendingTasks: input.pendingTasks ?? 0,
      };
      setCourses((prev) => [...prev, course]);
      return course;
    },
    [courses.length],
  );

  const value = useMemo<ScheduleStore>(
    () => ({ events, courses, addEvent, updateEvent, removeEvent, addCourse }),
    [events, courses, addEvent, updateEvent, removeEvent, addCourse],
  );

  return (
    <ScheduleStoreContext.Provider value={value}>
      {children}
    </ScheduleStoreContext.Provider>
  );
}

export function useScheduleStore(): ScheduleStore {
  const ctx = useContext(ScheduleStoreContext);
  if (!ctx) {
    throw new Error("useScheduleStore must be used inside ScheduleStoreProvider");
  }
  return ctx;
}
