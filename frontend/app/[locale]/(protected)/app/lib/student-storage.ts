export const STUDENT_PROFILE_KEY = "mitsyy_student_profile";
export const CHECKIN_PREFIX = "mitsyy_checkin_";

export type StudentProfile = {
  name: string;
  university: string;
  career: string;
  cycle: string;
};

export function getTodayKey(): string {
  return `${CHECKIN_PREFIX}${new Date().toISOString().slice(0, 10)}`;
}

export function hasCheckInToday(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getTodayKey()) !== null;
}

export function saveCheckIn(mood: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getTodayKey(), mood);
}

export function getStudentProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
}

export function hasStudentProfile(): boolean {
  return getStudentProfile() !== null;
}
