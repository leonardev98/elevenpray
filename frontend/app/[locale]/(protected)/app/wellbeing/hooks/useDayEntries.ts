"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  createDayEntry,
  getDayEntries,
  type CreateDayEntryPayload,
  type DayEntryDto,
} from "@/app/lib/day-entries-api";

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useDayEntries(selectedDate?: string) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<DayEntryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const day = selectedDate ?? toYmd(new Date());

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
      ),
    [entries],
  );

  const reload = useCallback(async () => {
    if (!token) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const items = await getDayEntries(token, day);
      setEntries(items);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [token, day]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addEntry = useCallback(
    async (payload: CreateDayEntryPayload): Promise<DayEntryDto | null> => {
      if (!token) return null;

      const optimistic: DayEntryDto = {
        id: `optimistic-${Date.now()}`,
        entryDate: payload.entryDate ?? day,
        entryType: payload.entryType,
        payload: payload.payload ?? {},
        occurredAt: new Date().toISOString(),
      };
      setEntries((prev) => [...prev, optimistic]);

      try {
        const created = await createDayEntry(token, { ...payload, entryDate: payload.entryDate ?? day });
        setEntries((prev) => [...prev.filter((item) => item.id !== optimistic.id), created]);
        return created;
      } catch (err) {
        setEntries((prev) => prev.filter((item) => item.id !== optimistic.id));
        throw err;
      }
    },
    [token, day],
  );

  return {
    day,
    entries: sortedEntries,
    loading,
    addEntry,
    reload,
  };
}
