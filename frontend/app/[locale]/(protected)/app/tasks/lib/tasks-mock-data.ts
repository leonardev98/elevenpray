export type CourseCode = "MAT150" | "FIS201" | "CS110" | "COM105";
export type TaskPriority = "alta" | "media" | "baja";
export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskSection = "urgent" | "week" | "soon";
export type TaskViewMode = "list" | "kanban" | "calendar";

export type MockStudentTask = {
  id: string;
  title: string;
  courseCode: CourseCode;
  dueDateLabel: string;
  dueDateIso: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  estimatedHours: number;
  estimatedMinutes: number;
  section: TaskSection;
  progress?: number;
  reminder?: string;
  completedLabel?: string;
};

export const MOCK_STUDENT_TASKS: MockStudentTask[] = [
  {
    id: "t1",
    title: "Entrega PC2 — Integrales",
    courseCode: "MAT150",
    dueDateLabel: "miércoles 20 may",
    dueDateIso: "2026-05-20",
    priority: "alta",
    status: "pending",
    description: "Resolver ejercicios del capítulo 8, problemas 1-15",
    estimatedHours: 2,
    estimatedMinutes: 0,
    section: "urgent",
    reminder: "1 día antes",
  },
  {
    id: "t2",
    title: "Proyecto final — API REST",
    courseCode: "CS110",
    dueDateLabel: "viernes 22 may",
    dueDateIso: "2026-05-22",
    priority: "alta",
    status: "in_progress",
    description: "Implementar endpoints CRUD para el módulo de usuarios",
    estimatedHours: 5,
    estimatedMinutes: 0,
    section: "urgent",
    progress: 40,
    reminder: "1 día antes",
  },
  {
    id: "t3",
    title: "Informe de laboratorio 4",
    courseCode: "FIS201",
    dueDateLabel: "jueves 21 may",
    dueDateIso: "2026-05-21",
    priority: "media",
    status: "pending",
    description: "Redactar conclusiones del experimento de ondas",
    estimatedHours: 1,
    estimatedMinutes: 30,
    section: "week",
    reminder: "1 día antes",
  },
  {
    id: "t4",
    title: "Quiz capítulo 7",
    courseCode: "CS110",
    dueDateLabel: "domingo 24 may",
    dueDateIso: "2026-05-24",
    priority: "media",
    status: "pending",
    description: "Repasar árboles binarios y grafos",
    estimatedHours: 1,
    estimatedMinutes: 0,
    section: "week",
    reminder: "1 día antes",
  },
  {
    id: "t5",
    title: "Exposición grupal — Termodinámica",
    courseCode: "FIS201",
    dueDateLabel: "lunes 2 jun",
    dueDateIso: "2026-06-02",
    priority: "baja",
    status: "pending",
    description: "Preparar diapositivas y ensayar con el grupo",
    estimatedHours: 3,
    estimatedMinutes: 0,
    section: "soon",
    reminder: "1 día antes",
  },
  {
    id: "t6",
    title: "Ensayo final — Comunicación",
    courseCode: "COM105",
    dueDateLabel: "viernes 6 jun",
    dueDateIso: "2026-06-06",
    priority: "media",
    status: "pending",
    description: "Redactar ensayo argumentativo de 5 páginas",
    estimatedHours: 4,
    estimatedMinutes: 0,
    section: "soon",
    reminder: "1 día antes",
  },
  {
    id: "t7",
    title: "Taller de álgebra lineal",
    courseCode: "MAT150",
    dueDateLabel: "completado hace 2 días",
    dueDateIso: "2026-05-17",
    priority: "media",
    status: "done",
    description: "Ejercicios de matrices y determinantes",
    estimatedHours: 2,
    estimatedMinutes: 0,
    section: "week",
    completedLabel: "completado hace 2 días",
  },
];

export const SECTION_CONFIG: {
  id: TaskSection;
  label: string;
  icon: "alert" | "clock" | "calendar";
}[] = [
  { id: "urgent", label: "Urgente — Hoy y mañana", icon: "alert" },
  { id: "week", label: "Esta semana", icon: "clock" },
  { id: "soon", label: "Próximamente", icon: "calendar" },
];

export function getTasksBySection(section: TaskSection): MockStudentTask[] {
  return MOCK_STUDENT_TASKS.filter((t) => t.section === section && t.status !== "done");
}

export type KanbanColumnId = "pending" | "in_progress" | "done";

export const KANBAN_COLUMNS: {
  id: KanbanColumnId;
  label: string;
  dotColor: string;
  barColor: string;
}[] = [
  { id: "pending", label: "Por hacer", dotColor: "bg-[var(--text-muted)]", barColor: "bg-[var(--text-muted)]" },
  {
    id: "in_progress",
    label: "En progreso",
    dotColor: "bg-[var(--warning)]",
    barColor: "bg-[var(--warning)]",
  },
  { id: "done", label: "Completado", dotColor: "bg-[var(--success)]", barColor: "bg-[var(--success)]" },
];

const KANBAN_TASK_IDS: Record<KanbanColumnId, string[]> = {
  pending: ["t1", "t3", "t4"],
  in_progress: ["t2"],
  done: ["t7"],
};

export function getKanbanTasks(columnId: KanbanColumnId): MockStudentTask[] {
  return KANBAN_TASK_IDS[columnId]
    .map((id) => MOCK_STUDENT_TASKS.find((t) => t.id === id))
    .filter((t): t is MockStudentTask => Boolean(t));
}

export type CalendarChip = {
  id: string;
  taskId: string;
  shortLabel: string;
  fullTitle: string;
  courseCode: CourseCode;
  dueDateLabel: string;
  priority: TaskPriority;
  estimatedLabel: string;
};

export const CALENDAR_WEEK_START = "2026-05-19";
export const CALENDAR_WEEK_END = "2026-05-25";
export const CALENDAR_TODAY_ISO = "2026-05-20";

export const CALENDAR_WEEK_DAYS: { iso: string; letter: string; dayNum: number }[] = [
  { iso: "2026-05-19", letter: "L", dayNum: 19 },
  { iso: "2026-05-20", letter: "M", dayNum: 20 },
  { iso: "2026-05-21", letter: "X", dayNum: 21 },
  { iso: "2026-05-22", letter: "J", dayNum: 22 },
  { iso: "2026-05-23", letter: "V", dayNum: 23 },
  { iso: "2026-05-24", letter: "S", dayNum: 24 },
  { iso: "2026-05-25", letter: "D", dayNum: 25 },
];

export const CALENDAR_CHIPS_BY_DAY: Record<string, CalendarChip[]> = {
  "2026-05-19": [],
  "2026-05-20": [
    {
      id: "c1",
      taskId: "t1",
      shortLabel: "PC2 Integrales",
      fullTitle: "Entrega PC2 — Integrales",
      courseCode: "MAT150",
      dueDateLabel: "miércoles 20 may",
      priority: "alta",
      estimatedLabel: "2h",
    },
  ],
  "2026-05-21": [
    {
      id: "c2",
      taskId: "t3",
      shortLabel: "Lab 4",
      fullTitle: "Informe de laboratorio 4",
      courseCode: "FIS201",
      dueDateLabel: "jueves 21 may",
      priority: "media",
      estimatedLabel: "1h 30min",
    },
  ],
  "2026-05-22": [
    {
      id: "c3",
      taskId: "t2",
      shortLabel: "Proyecto API",
      fullTitle: "Proyecto final — API REST",
      courseCode: "CS110",
      dueDateLabel: "viernes 22 may",
      priority: "alta",
      estimatedLabel: "5h",
    },
  ],
  "2026-05-23": [],
  "2026-05-24": [
    {
      id: "c4",
      taskId: "t4",
      shortLabel: "Quiz cap.7",
      fullTitle: "Quiz capítulo 7",
      courseCode: "CS110",
      dueDateLabel: "domingo 24 may",
      priority: "media",
      estimatedLabel: "1h",
    },
  ],
  "2026-05-25": [],
};

export const COURSE_LOAD = [
  { code: "CS110" as CourseCode, name: "Programación I", count: 3, max: 3 },
  { code: "MAT150" as CourseCode, name: "Matemática", count: 1, max: 3 },
  { code: "FIS201" as CourseCode, name: "Física General", count: 2, max: 3 },
  { code: "COM105" as CourseCode, name: "Comunicación", count: 1, max: 3 },
];

export const NEXT_DUE_TASK = MOCK_STUDENT_TASKS.find((t) => t.id === "t1")!;
