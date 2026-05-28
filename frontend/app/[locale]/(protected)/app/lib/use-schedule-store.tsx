"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type MockScheduleEvent } from "./mock-student-data";
import { loadScheduleEvents, saveScheduleEvents } from "./schedule-storage";

type AddEventInput = Omit<MockScheduleEvent, "id">;

type ScheduleStore = {
  events: MockScheduleEvent[];
  addEvent: (input: AddEventInput) => MockScheduleEvent;
  updateEvent: (id: string, patch: Partial<MockScheduleEvent>) => void;
  removeEvent: (id: string) => void;
  hydrated: boolean;
};

const ScheduleStoreContext = createContext<ScheduleStore | null>(null);

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ScheduleStoreProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [events, setEvents] = useState<MockScheduleEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEvents(loadScheduleEvents(userId));
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!hydrated || !userId) return;
    saveScheduleEvents(userId, events);
  }, [events, userId, hydrated]);

  const addEvent = useCallback((input: AddEventInput): MockScheduleEvent => {
    const event: MockScheduleEvent = { id: generateId("local"), ...input };
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

  const value = useMemo<ScheduleStore>(
    () => ({
      events,
      addEvent,
      updateEvent,
      removeEvent,
      hydrated,
    }),
    [events, addEvent, updateEvent, removeEvent, hydrated],
  );

  return (
    <ScheduleStoreContext.Provider value={value}>{children}</ScheduleStoreContext.Provider>
  );
}

export function useScheduleStore(): ScheduleStore {
  const ctx = useContext(ScheduleStoreContext);
  if (!ctx) {
    throw new Error("useScheduleStore must be used inside ScheduleStoreProvider");
  }
  return ctx;
}
