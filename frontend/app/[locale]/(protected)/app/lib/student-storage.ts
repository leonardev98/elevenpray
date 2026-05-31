export const STUDENT_PROFILE_KEY_PREFIX = "mitsyy_student_profile_";
/** @deprecated Usar clave por usuario; se mantiene solo para migración. */
export const STUDENT_PROFILE_KEY_LEGACY = "mitsyy_student_profile";
export const CHECKIN_PREFIX = "mitsyy_checkin_";

import type { StudentGradeScale } from "@/lib/student-grade-scale";

export type StudentProfile = {
  name: string;
  university: string;
  career: string;
  cycle: string;
  institutionType?: "tecnico" | "universidad";
  gradeScale?: StudentGradeScale;
};

function profileKey(userId: string): string {
  return `${STUDENT_PROFILE_KEY_PREFIX}${userId}`;
}

export function getTodayKey(userId?: string | null): string {
  const date = new Date().toISOString().slice(0, 10);
  if (userId) return `${CHECKIN_PREFIX}${userId}_${date}`;
  return `${CHECKIN_PREFIX}${date}`;
}

export type DailyCheckIn = {
  mood: string;
  note?: string;
  factors?: string[];
};

function parseCheckInValue(raw: string): DailyCheckIn | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "mood" in parsed) {
      const { mood, note, factors } = parsed as DailyCheckIn;
      if (typeof mood === "string") {
        const result: DailyCheckIn = {
          mood,
          note: typeof note === "string" ? note : undefined,
        };
        if (Array.isArray(factors) && factors.every((f) => typeof f === "string")) {
          result.factors = factors;
        }
        return result;
      }
    }
  } catch {
    /* legacy plain mood string */
  }
  if (raw.length > 0) return { mood: raw };
  return null;
}

export function getTodayCheckIn(userId?: string | null): DailyCheckIn | null {
  if (typeof window === "undefined") return null;
  const key = getTodayKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return parseCheckInValue(raw);
}

export function hasCheckInToday(userId?: string | null): boolean {
  if (typeof window === "undefined") return true;
  return getTodayCheckIn(userId) !== null;
}

export function saveTodayCheckIn(
  mood: string,
  note: string | undefined,
  factors: string[] | undefined,
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;
  const payload: DailyCheckIn = { mood };
  const trimmed = note?.trim();
  if (trimmed) payload.note = trimmed;
  if (factors && factors.length > 0) payload.factors = factors;
  localStorage.setItem(getTodayKey(userId), JSON.stringify(payload));
}

function checkInKeyForDate(date: Date, userId?: string | null): string {
  const ymd = date.toISOString().slice(0, 10);
  if (userId) return `${CHECKIN_PREFIX}${userId}_${ymd}`;
  return `${CHECKIN_PREFIX}${ymd}`;
}

/** Historial local de check-ins (últimos N días, más reciente al final). */
export function getEmotionalCheckInHistory(
  userId?: string | null,
  days = 70,
): { date: string; mood: string; factors?: string[] }[] {
  if (typeof window === "undefined") return [];
  const results: { date: string; mood: string; factors?: string[] }[] = [];
  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const key = checkInKeyForDate(cursor, userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = parseCheckInValue(raw);
      if (parsed) {
        results.push({
          date: cursor.toISOString().slice(0, 10),
          mood: parsed.mood,
          factors: parsed.factors,
        });
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return results.reverse();
}

/** Dias consecutivos con check-in emocional (incluye hoy si ya registro). */
export function getEmotionalCheckInStreak(userId?: string | null): number {
  if (typeof window === "undefined") return 0;
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = checkInKeyForDate(cursor, userId);
    if (!localStorage.getItem(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** @deprecated Use saveTodayCheckIn */
export function saveCheckIn(mood: string, userId?: string | null): void {
  saveTodayCheckIn(mood, undefined, undefined, userId);
}

export function getStudentProfile(userId?: string | null): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    if (userId) {
      const raw = localStorage.getItem(profileKey(userId));
      if (raw) return JSON.parse(raw) as StudentProfile;
    }
    const legacy = localStorage.getItem(STUDENT_PROFILE_KEY_LEGACY);
    if (legacy) return JSON.parse(legacy) as StudentProfile;
    return null;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile, userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
  localStorage.removeItem(STUDENT_PROFILE_KEY_LEGACY);
}

export function hasStudentProfile(userId?: string | null): boolean {
  return getStudentProfile(userId) !== null;
}

export function clearStudentProfileForUser(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(profileKey(userId));
}

export function clearAllStudentProfiles(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STUDENT_PROFILE_KEY_LEGACY);
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(STUDENT_PROFILE_KEY_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
