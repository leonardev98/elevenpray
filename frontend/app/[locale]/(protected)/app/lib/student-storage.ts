export const STUDENT_PROFILE_KEY_PREFIX = "mitsyy_student_profile_";
/** @deprecated Usar clave por usuario; se mantiene solo para migración. */
export const STUDENT_PROFILE_KEY_LEGACY = "mitsyy_student_profile";
export const CHECKIN_PREFIX = "mitsyy_checkin_";

export type StudentProfile = {
  name: string;
  university: string;
  career: string;
  cycle: string;
};

function profileKey(userId: string): string {
  return `${STUDENT_PROFILE_KEY_PREFIX}${userId}`;
}

export function getTodayKey(userId?: string | null): string {
  const date = new Date().toISOString().slice(0, 10);
  if (userId) return `${CHECKIN_PREFIX}${userId}_${date}`;
  return `${CHECKIN_PREFIX}${date}`;
}

export function hasCheckInToday(userId?: string | null): boolean {
  if (typeof window === "undefined") return true;
  if (userId && localStorage.getItem(getTodayKey(userId)) !== null) return true;
  return localStorage.getItem(getTodayKey()) !== null;
}

export function saveCheckIn(mood: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTodayKey(userId), mood);
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
