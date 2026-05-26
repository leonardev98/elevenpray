export type MockCourse = {
  id: string;
  name: string;
  code: string;
  color: string;
  professor: string;
  pendingTasks: number;
};

export type MockClassSession = {
  id: string;
  courseId: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
};

export type MockTask = {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: "pending" | "in_progress" | "done";
};

export type ScheduleEventKind = "class" | "task" | "extra" | "exam";

export type MockScheduleEvent = {
  id: string;
  date: string;
  kind: ScheduleEventKind;
  title: string;
  subtitle?: string;
  startTime: string;
  endTime: string;
  courseId?: string;
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return ymd(d);
}

/** Eventos de agenda con solapes (demo). Fechas relativas a hoy. */
export const MOCK_SCHEDULE_EVENTS: MockScheduleEvent[] = [
  // Hoy — mañana con solapes estilo referencia
  {
    id: "e1",
    date: dayOffset(0),
    kind: "class",
    title: "Geografía",
    subtitle: "Desastres naturales",
    startTime: "09:00",
    endTime: "10:00",
    courseId: "c4",
  },
  {
    id: "e2",
    date: dayOffset(0),
    kind: "class",
    title: "Inglés",
    subtitle: "Vocabulario académico",
    startTime: "10:00",
    endTime: "11:00",
    courseId: "c4",
  },
  {
    id: "e3",
    date: dayOffset(0),
    kind: "task",
    title: "Inglés",
    subtitle: "Ensayo 800 palabras",
    startTime: "10:00",
    endTime: "12:00",
    courseId: "c4",
  },
  {
    id: "e4",
    date: dayOffset(0),
    kind: "class",
    title: "Matemáticas",
    subtitle: "Integrales definidas",
    startTime: "12:00",
    endTime: "13:00",
    courseId: "c1",
  },
  {
    id: "e5",
    date: dayOffset(0),
    kind: "extra",
    title: "Almuerzo",
    subtitle: "Pausa",
    startTime: "13:00",
    endTime: "14:00",
  },
  {
    id: "e6",
    date: dayOffset(0),
    kind: "class",
    title: "Biología",
    subtitle: "Genética molecular",
    startTime: "14:00",
    endTime: "15:30",
    courseId: "c2",
  },
  {
    id: "e7",
    date: dayOffset(0),
    kind: "task",
    title: "Hoja de trabajo",
    subtitle: "Cap. 4 — célula",
    startTime: "14:30",
    endTime: "15:30",
    courseId: "c2",
  },
  {
    id: "e8",
    date: dayOffset(0),
    kind: "exam",
    title: "Examen Biología",
    subtitle: "Unidad 3",
    startTime: "16:00",
    endTime: "17:30",
    courseId: "c2",
  },
  {
    id: "e9",
    date: dayOffset(0),
    kind: "extra",
    title: "Fútbol",
    subtitle: "Cancha universitaria",
    startTime: "17:30",
    endTime: "18:30",
  },
  {
    id: "e10",
    date: dayOffset(0),
    kind: "extra",
    title: "Bus a casa",
    startTime: "18:30",
    endTime: "19:00",
  },
  // Mañana — día más ligero
  {
    id: "e11",
    date: dayOffset(1),
    kind: "class",
    title: "Programación I",
    subtitle: "Estructuras de datos",
    startTime: "09:30",
    endTime: "11:30",
    courseId: "c3",
  },
  {
    id: "e12",
    date: dayOffset(1),
    kind: "task",
    title: "Proyecto API REST",
    subtitle: "Entrega parcial",
    startTime: "14:00",
    endTime: "16:00",
    courseId: "c3",
  },
  // Ayer
  {
    id: "e13",
    date: dayOffset(-1),
    kind: "class",
    title: "Matemática",
    subtitle: "Repaso parcial",
    startTime: "08:00",
    endTime: "10:00",
    courseId: "c1",
  },
];

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "c1",
    name: "Matemática",
    code: "MAT150",
    color: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)] border-[var(--course-1-fg)]/30",
    professor: "Juan",
    pendingTasks: 2,
  },
  {
    id: "c2",
    name: "Física General",
    code: "FIS201",
    color: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)] border-[var(--course-4-fg)]/30",
    professor: "Dra. Mendoza",
    pendingTasks: 1,
  },
  {
    id: "c3",
    name: "Programación I",
    code: "CS110",
    color: "bg-[var(--course-2-bg)] text-[var(--course-2-fg)] border-[var(--course-2-fg)]/30",
    professor: "Ing. Torres",
    pendingTasks: 3,
  },
  {
    id: "c4",
    name: "Comunicación",
    code: "COM105",
    color: "bg-[var(--course-6-bg)] text-[var(--course-6-fg)] border-[var(--course-6-fg)]/30",
    professor: "Lic. Vargas",
    pendingTasks: 0,
  },
];

export const MOCK_CLASSES_TODAY: MockClassSession[] = [
  {
    id: "s1",
    courseId: "c1",
    title: "Matemática",
    startTime: "08:00",
    endTime: "10:00",
    room: "A-204",
  },
  {
    id: "s2",
    courseId: "c3",
    title: "Programación I",
    startTime: "14:00",
    endTime: "16:00",
    room: "Lab 3",
  },
  {
    id: "s3",
    courseId: "c2",
    title: "Física General",
    startTime: "16:30",
    endTime: "18:00",
    room: "B-101",
  },
];

export const MOCK_TASKS: MockTask[] = [
  {
    id: "t1",
    courseId: "c1",
    title: "Entrega PC2 — Integrales",
    dueDate: "2026-05-21",
    status: "pending",
  },
  {
    id: "t2",
    courseId: "c3",
    title: "Proyecto final — API REST",
    dueDate: "2026-05-23",
    status: "in_progress",
  },
  {
    id: "t3",
    courseId: "c2",
    title: "Informe de laboratorio 4",
    dueDate: "2026-05-22",
    status: "pending",
  },
  {
    id: "t4",
    courseId: "c3",
    title: "Quiz capítulo 7",
    dueDate: "2026-05-25",
    status: "pending",
  },
];