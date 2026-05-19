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
    title: "Cálculo I",
    subtitle: "Repaso parcial",
    startTime: "08:00",
    endTime: "10:00",
    courseId: "c1",
  },
];

export type MockCommunityNote = {
  id: string;
  course: string;
  university: string;
  author: string;
  preview: string;
  likes: number;
};

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "c1",
    name: "Cálculo I",
    code: "MAT101",
    color: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    professor: "Dr. García",
    pendingTasks: 2,
  },
  {
    id: "c2",
    name: "Física General",
    code: "FIS201",
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    professor: "Dra. Mendoza",
    pendingTasks: 1,
  },
  {
    id: "c3",
    name: "Programación I",
    code: "CS110",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    professor: "Ing. Torres",
    pendingTasks: 3,
  },
  {
    id: "c4",
    name: "Comunicación",
    code: "COM105",
    color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    professor: "Lic. Vargas",
    pendingTasks: 0,
  },
];

export const MOCK_CLASSES_TODAY: MockClassSession[] = [
  {
    id: "s1",
    courseId: "c1",
    title: "Cálculo I",
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

export const MOCK_COMMUNITY: MockCommunityNote[] = [
  {
    id: "n1",
    course: "Cálculo I — UNI",
    university: "UNI",
    author: "Ana R.",
    preview: "Resumen de integrales por partes para el parcial…",
    likes: 24,
  },
  {
    id: "n2",
    course: "Física General — UPC",
    university: "UPC",
    author: "Luis M.",
    preview: "Apuntes clase 12: cinemática rotacional con ejemplos…",
    likes: 18,
  },
  {
    id: "n3",
    course: "Programación I — PUCP",
    university: "PUCP",
    author: "Carla S.",
    preview: "Plantilla de estructuras de datos en Python para el TP…",
    likes: 31,
  },
];

export const MOCK_WELLBEING_TIMELINE = [
  { date: "Lun", mood: "🙂", label: "Bien" },
  { date: "Mar", mood: "😐", label: "Normal" },
  { date: "Mié", mood: "😟", label: "Medio mal" },
  { date: "Jue", mood: "🙂", label: "Bien" },
  { date: "Vie", mood: "😄", label: "Excelente" },
];

export const MOCK_SELF_HELP = [
  { id: "h1", title: "Respiración 4-7-8", duration: "3 min", type: "breathing" },
  { id: "h2", title: "Pausa visual — descanso de pantalla", duration: "5 min", type: "visual" },
  { id: "h3", title: "Reencuadre ante el bloqueo", duration: "8 min", type: "cognitive" },
];
