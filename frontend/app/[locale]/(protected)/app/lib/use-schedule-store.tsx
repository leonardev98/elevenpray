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
  "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/30",
  "bg-[var(--course-2-bg)] text-[var(--course-2-fg)] border-[var(--course-2-fg)]/30",
  "bg-[var(--course-3-bg)] text-[var(--course-3-fg)] border-[var(--course-3-fg)]/30",
  "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/30",
  "bg-[var(--course-5-bg)] text-[var(--course-5-fg)] border-[var(--course-5-fg)]/30",
  "bg-[var(--course-6-bg)] text-[var(--course-6-fg)] border-[var(--course-6-fg)]/30",
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
