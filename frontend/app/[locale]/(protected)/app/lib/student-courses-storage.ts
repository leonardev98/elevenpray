/** Cursos del alumno persistidos en el navegador (Mitsyy). Misma forma que `MockCourseExtended` sin importar mock-course-data (evita ciclos). */

export type StudentCourseAccent = "violet" | "teal" | "amber" | "rose" | "sky" | "emerald";

/** Rango por día (letra L, M, X… igual que `classDays`). Horas `HH:mm` 24 h. */
export type CourseScheduleSlot = {
  day: string;
  start: string;
  end: string;
};

export type StudentCourseStored = {
  id: string;
  name: string;
  code: string;
  color: string;
  professor: string;
  pendingTasks: number;
  accent: StudentCourseAccent;
  classDays: string[];
  progressPercent: number;
  weeksCurrent: number;
  weeksTotal: number;
  streakDays: number;
  colorHex?: string | null;
  modality?: string | null;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  scheduleSlots?: CourseScheduleSlot[] | null;
};

const STORAGE_KEY = "mitsyy_student_courses_v1";

const ACCENT_TO_COLOR: Record<StudentCourseAccent, string> = {
  teal: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

/** Paleta del modal → acento interno (progreso / tabs). */
export function hexToStudentAccent(hex: string): StudentCourseAccent {
  const n = hex.trim().toLowerCase();
  if (n === "#0d9488") return "teal";
  if (n === "#7c3aed") return "violet";
  if (n === "#2563eb") return "sky";
  if (n === "#d97706") return "amber";
  if (n === "#dc2626") return "rose";
  if (n === "#059669") return "emerald";
  if (n === "#db2777") return "rose";
  return "teal";
}

export function isMockCoursesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STUDENT_MOCK_COURSES === "true";
}

function isCourseAccent(x: unknown): x is StudentCourseAccent {
  return x === "violet" || x === "teal" || x === "amber" || x === "rose" || x === "sky" || x === "emerald";
}

function normalizeScheduleSlot(x: unknown): CourseScheduleSlot | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.day !== "string" || typeof o.start !== "string" || typeof o.end !== "string") return null;
  return { day: o.day, start: o.start, end: o.end };
}

function normalizeStoredCourse(raw: Record<string, unknown>): StudentCourseStored | null {
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  const accent = isCourseAccent(raw.accent) ? raw.accent : "teal";
  const classDays = Array.isArray(raw.classDays) ? raw.classDays.filter((d): d is string => typeof d === "string") : [];
  const scheduleSlotsRaw = Array.isArray(raw.scheduleSlots)
    ? (raw.scheduleSlots.map(normalizeScheduleSlot).filter(Boolean) as CourseScheduleSlot[])
    : [];
  return {
    id: raw.id,
    name: raw.name,
    code: typeof raw.code === "string" ? raw.code : "",
    color: typeof raw.color === "string" ? raw.color : ACCENT_TO_COLOR[accent],
    professor: typeof raw.professor === "string" ? raw.professor : "",
    pendingTasks: typeof raw.pendingTasks === "number" ? raw.pendingTasks : 0,
    accent,
    classDays,
    progressPercent: typeof raw.progressPercent === "number" ? raw.progressPercent : 0,
    weeksCurrent: typeof raw.weeksCurrent === "number" ? raw.weeksCurrent : 0,
    weeksTotal: typeof raw.weeksTotal === "number" ? raw.weeksTotal : 16,
    streakDays: typeof raw.streakDays === "number" ? raw.streakDays : 0,
    colorHex: (raw.colorHex ?? null) as string | null,
    modality: (raw.modality ?? null) as string | null,
    scheduleStart: (raw.scheduleStart ?? null) as string | null,
    scheduleEnd: (raw.scheduleEnd ?? null) as string | null,
    scheduleSlots: scheduleSlotsRaw.length > 0 ? scheduleSlotsRaw : null,
  };
}

export function loadPersistedStudentCourses(): StudentCourseStored[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => (item && typeof item === "object" ? normalizeStoredCourse(item as Record<string, unknown>) : null))
      .filter((c): c is StudentCourseStored => c != null);
  } catch {
    return [];
  }
}

export function savePersistedStudentCourses(courses: StudentCourseStored[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function appendPersistedStudentCourse(course: StudentCourseStored): void {
  const next = [...loadPersistedStudentCourses(), course];
  savePersistedStudentCourses(next);
}

export type CourseModality = "Presencial" | "Remoto" | "Semipresencial";

export type NewStudentCourseInput = {
  name: string;
  code: string;
  professor: string;
  colorHex: string;
  classDays: string[];
  modality: CourseModality;
  weeksTotal: number;
  scheduleStart?: string;
  scheduleEnd?: string;
  /** Si hay slots, tiene prioridad sobre `scheduleStart`/`scheduleEnd` (horario distinto por día). */
  scheduleSlots?: CourseScheduleSlot[];
};

export function buildStudentCourseFromInput(input: NewStudentCourseInput): StudentCourseStored {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `course-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const accent = hexToStudentAccent(input.colorHex);
  const weeksTotal = Math.min(20, Math.max(8, Math.round(Number(input.weeksTotal) || 16)));
  const start = input.scheduleStart?.trim();
  const end = input.scheduleEnd?.trim();
  const slots = (input.scheduleSlots ?? []).filter((s) => s.start?.trim() && s.end?.trim());
  const hasSlots = slots.length > 0;
  return {
    id,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase() || "—",
    color: ACCENT_TO_COLOR[accent],
    professor: input.professor.trim() || "—",
    pendingTasks: 0,
    accent,
    classDays: input.classDays.length > 0 ? input.classDays : ["—"],
    progressPercent: 0,
    weeksCurrent: 0,
    weeksTotal,
    streakDays: 0,
    colorHex: input.colorHex,
    modality: input.modality,
    scheduleStart: hasSlots ? null : start && start.length > 0 ? start : null,
    scheduleEnd: hasSlots ? null : end && end.length > 0 ? end : null,
    scheduleSlots: hasSlots ? slots : null,
  };
}
