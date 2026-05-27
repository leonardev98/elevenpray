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
  /** Créditos académicos del curso (para promedio ponderado del ciclo). */
  credits?: number | null;
};

const STORAGE_KEY = "mitsyy_student_courses_v1";

const ACCENT_TO_COLOR: Record<StudentCourseAccent, string> = {
  teal: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/30",
  violet: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/30",
  amber: "bg-[var(--course-2-bg)] text-[var(--course-2-fg)] border-[var(--course-2-fg)]/30",
  rose: "bg-[var(--course-6-bg)] text-[var(--course-6-fg)] border-[var(--course-6-fg)]/30",
  sky: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)] border-[var(--course-3-fg)]/30",
  emerald: "bg-[var(--course-5-bg)] text-[var(--course-5-fg)] border-[var(--course-5-fg)]/30",
};

/** Paleta Paper del modal → acento interno (progreso / tabs). */
export function hexToStudentAccent(hex: string): StudentCourseAccent {
  const n = hex.trim().toLowerCase();
  if (n === "#3d5a2f") return "teal";
  if (n === "#4a5a6b") return "violet";
  if (n === "#6b5a3d") return "sky";
  if (n === "#8a6e3d") return "amber";
  if (n === "#6b3d3d") return "rose";
  if (n === "#8a5a3d") return "emerald";
  if (n === "#7a8a9f") return "violet";
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
    credits:
      typeof raw.credits === "number" && Number.isFinite(raw.credits)
        ? clampCourseCredits(raw.credits)
        : null,
  };
}

/** Normaliza créditos a [0, 99] con hasta 2 decimales. */
export function clampCourseCredits(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value * 100) / 100;
  return Math.min(99, Math.max(0, rounded));
}

/**
 * Promedio ponderado por créditos (porcentaje 0–100).
 * Omite cursos sin créditos o sin nota registrada.
 */
export function computeCreditWeightedGradeAverage(
  entries: ReadonlyArray<{ credits: number | null | undefined; gradePercent: number | null | undefined }>,
): number | null {
  let weighted = 0;
  let totalCredits = 0;
  for (const entry of entries) {
    const credits = entry.credits ?? 0;
    const grade = entry.gradePercent;
    if (credits <= 0 || grade == null || !Number.isFinite(grade)) continue;
    weighted += grade * credits;
    totalCredits += credits;
  }
  if (totalCredits <= 0) return null;
  return Number((weighted / totalCredits).toFixed(2));
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

/** Actualiza un curso por id conservando los campos no incluidos en `patch`. */
export function updatePersistedStudentCourse(
  id: string,
  patch: Partial<Omit<StudentCourseStored, "id">>,
): StudentCourseStored | null {
  const all = loadPersistedStudentCourses();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const next = [...all];
  next[idx] = { ...next[idx], ...patch, id };
  savePersistedStudentCourses(next);
  return next[idx];
}

/** Elimina un curso por id. Devuelve `true` si efectivamente se eliminó. */
export function removePersistedStudentCourse(id: string): boolean {
  const all = loadPersistedStudentCourses();
  const next = all.filter((c) => c.id !== id);
  if (next.length === all.length) return false;
  savePersistedStudentCourses(next);
  return true;
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
  credits: number;
};

/** Patch de edición a partir del mismo input del formulario; preserva id, progreso, racha y tareas pendientes. */
export function buildStudentCourseUpdateFromInput(
  existing: StudentCourseStored,
  input: NewStudentCourseInput,
): StudentCourseStored {
  const accent = hexToStudentAccent(input.colorHex);
  const weeksTotal = Math.min(20, Math.max(8, Math.round(Number(input.weeksTotal) || 16)));
  const start = input.scheduleStart?.trim();
  const end = input.scheduleEnd?.trim();
  const slots = (input.scheduleSlots ?? []).filter((s) => s.start?.trim() && s.end?.trim());
  const hasSlots = slots.length > 0;
  return {
    ...existing,
    name: input.name.trim() || existing.name,
    code: input.code.trim().toUpperCase() || "—",
    color: ACCENT_TO_COLOR[accent],
    professor: input.professor.trim() || "—",
    accent,
    classDays: input.classDays.length > 0 ? input.classDays : ["—"],
    weeksTotal,
    colorHex: input.colorHex,
    modality: input.modality,
    scheduleStart: hasSlots ? null : start && start.length > 0 ? start : null,
    scheduleEnd: hasSlots ? null : end && end.length > 0 ? end : null,
    scheduleSlots: hasSlots ? slots : null,
    credits: clampCourseCredits(input.credits),
  };
}

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
    credits: clampCourseCredits(input.credits),
  };
}
