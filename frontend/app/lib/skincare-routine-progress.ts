/**
 * Client-side routine progress and today's day key for skincare dashboard.
 * Progress is stored in localStorage by workspace + date.
 */

import { DAY_KEYS } from "./routine-builder";
import type { DayContent, DayGroup, DayItem, Routine } from "./routines-api";

const STORAGE_KEY_PREFIX = "skincare_routine_progress_";

/** Get day key for today (monday, tuesday, ...) matching DAY_KEYS. */
export function getTodayDayKey(): string {
  const i = (new Date().getDay() + 6) % 7;
  return DAY_KEYS[i];
}

/** Get storage key for workspace + date (YYYY-MM-DD). */
export function getProgressStorageKey(workspaceId: string, date?: string): string {
  const d = date ?? new Date().toISOString().slice(0, 10);
  return `${STORAGE_KEY_PREFIX}${workspaceId}_${d}`;
}

/** Read completed step IDs for the day. Returns empty array if none. */
export function getCompletedStepIds(workspaceId: string, date?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getProgressStorageKey(workspaceId, date));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/** Persist completed step IDs for the day. */
export function setCompletedStepIds(
  workspaceId: string,
  completedIds: string[],
  date?: string
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getProgressStorageKey(workspaceId, date),
      JSON.stringify(completedIds)
    );
  } catch {
    // ignore
  }
}

/** Toggle step completed and return new completed list. */
export function toggleStepCompleted(
  workspaceId: string,
  stepId: string,
  date?: string
): string[] {
  const current = getCompletedStepIds(workspaceId, date);
  const next = current.includes(stepId)
    ? current.filter((id) => id !== stepId)
    : [...current, stepId];
  setCompletedStepIds(workspaceId, next, date);
  return next;
}

export interface RoutineStep {
  id: string;
  content: string;
  stepType?: string;
}

/** Extract flat list of steps (with id) for today from a routine template. */
export function getTodayStepsFromRoutine(
  routine: Routine | null | undefined,
  dayKey?: string
): RoutineStep[] {
  if (!routine?.days) return [];
  const key = dayKey ?? getTodayDayKey();
  const day = routine.days[key];
  if (!day?.groups?.length) return [];
  const steps: RoutineStep[] = [];
  for (const group of day.groups as DayGroup[]) {
    for (const item of group.items ?? []) {
      const it = item as DayItem & { id?: string };
      steps.push({
        id: it.id ?? `${group.id}-${it.content}-${steps.length}`,
        content: it.content || (it.stepType ?? ""),
        stepType: it.stepType,
      });
    }
  }
  return steps;
}

/** Steps for today grouped by slot (am / pm). Groups without slot go to "am". */
export function getTodayStepsBySlot(
  routine: Routine | null | undefined,
  dayKey?: string
): { am: RoutineStep[]; pm: RoutineStep[] } {
  const key = dayKey ?? getTodayDayKey();
  const day = routine?.days?.[key];
  const am: RoutineStep[] = [];
  const pm: RoutineStep[] = [];
  if (!day?.groups?.length) return { am, pm };
  for (const group of day.groups as DayGroup[]) {
    const slot = (group.slot === "pm" ? "pm" : "am") as "am" | "pm";
    const list = slot === "pm" ? pm : am;
    for (const item of group.items ?? []) {
      const it = item as DayItem & { id?: string };
      list.push({
        id: it.id ?? `${group.id}-${it.content}-${list.length}`,
        content: it.content || (it.stepType ?? ""),
        stepType: it.stepType,
      });
    }
  }
  return { am, pm };
}

/** Get today's day content from routine (for sidebar products). */
export function getTodayDayContent(
  routine: Routine | null | undefined,
  dayKey?: string
): DayContent | null {
  if (!routine?.days) return null;
  const key = dayKey ?? getTodayDayKey();
  return routine.days[key] ?? null;
}

/** Collect all product IDs from a day's groups. */
export function getProductIdsFromDayContent(day: DayContent | null): string[] {
  if (!day?.groups) return [];
  const ids: string[] = [];
  for (const group of day.groups as DayGroup[]) {
    for (const item of group.items ?? []) {
      const it = item as DayItem & { productId?: string };
      if (it.productId) ids.push(it.productId);
    }
  }
  return [...new Set(ids)];
}

/** Collect all product IDs from the entire routine (all days). */
export function getProductIdsFromRoutine(routine: Routine | null | undefined): string[] {
  if (!routine?.days) return [];
  const ids: string[] = [];
  for (const dayKey of Object.keys(routine.days)) {
    const day = routine.days[dayKey];
    ids.push(...getProductIdsFromDayContent(day ?? null));
  }
  return [...new Set(ids)];
}
