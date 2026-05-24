import { MOCK_COURSES, type MockCourse } from "./mock-student-data";
import { isMockCoursesEnabled, loadPersistedStudentCourses } from "./student-courses-storage";
import type { CourseScheduleSlot, StudentCourseStored } from "./student-courses-storage";

export {
  getCourseClasses,
  getCourseFlashcards,
  getCourseQuizHistoryDetailed,
  QUIZ_ACTIVE_C1,
  QUIZ_ACTIVE_QUESTIONS_C1,
} from "./course-detail-rich-mocks";
export type {
  MockCourseClassSession,
  MockFlashcard,
  MockQuizActive,
  MockQuizHistoryItem,
  MockQuizHistoryQuestion,
  MockQuizQuestion,
} from "./course-detail-rich-mocks";

export type CourseAccent = "violet" | "teal" | "amber" | "rose" | "sky" | "emerald";

export type MockCourseExtended = MockCourse & {
  accent: CourseAccent;
  classDays: string[];
  /** Letras en círculos (ej. L, X, V); si falta, la UI acorta el nombre del día. */
  classDayLetters?: string[];
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

export type MockCourseNote = {
  id: string;
  title: string;
  dateLabel: string;
  preview: string;
  body: string;
  classLabel?: string;
  readMinutes?: number;
};

export type TaskDueStatus = "overdue" | "soon" | "ok";

export type MockCourseTask = {
  id: string;
  title: string;
  dueDate: string;
  dueStatus?: TaskDueStatus;
  done: boolean;
  priority?: "alta" | "media" | "baja";
  taskStatus?: "pending" | "in_progress" | "completed";
  description?: string;
  progressPercent?: number;
};

export type MockCourseFile = {
  id: string;
  type: "pdf" | "image" | "other";
  name: string;
  size: string;
  uploadedAt: string;
  classLabel?: string;
};

export type MockCourseQuiz = {
  id: string;
  title: string;
  status: "completed" | "pending";
  score?: string;
  date: string;
};

/** Solo desarrollo: `NEXT_PUBLIC_STUDENT_MOCK_COURSES=true` muestra cursos de demo en lugar del almacenamiento local. */

function persistedToExtended(c: StudentCourseStored): MockCourseExtended {
  return { ...c, accent: c.accent as CourseAccent };
}

export const MOCK_COURSES_EXTENDED: MockCourseExtended[] = [
  {
    ...MOCK_COURSES[0],
    accent: "teal",
    classDays: ["Lunes", "Miércoles", "Viernes"],
    classDayLetters: ["L", "X", "V"],
    progressPercent: 18.75,
    weeksCurrent: 3,
    weeksTotal: 16,
    streakDays: 12,
    colorHex: "#0D9488",
    modality: "Presencial",
  },
  {
    ...MOCK_COURSES[1],
    accent: "violet",
    classDays: ["Martes", "Jueves"],
    progressPercent: 70,
    weeksCurrent: 11,
    weeksTotal: 16,
    streakDays: 8,
  },
  {
    ...MOCK_COURSES[2],
    accent: "amber",
    classDays: ["Lunes", "Jueves"],
    progressPercent: 20,
    weeksCurrent: 3,
    weeksTotal: 16,
    streakDays: 5,
  },
  {
    ...MOCK_COURSES[3],
    accent: "rose",
    classDays: ["Miércoles", "Viernes"],
    progressPercent: 90,
    weeksCurrent: 14,
    weeksTotal: 16,
    streakDays: 21,
  },
];

const NOTES_BY_COURSE: Record<string, MockCourseNote[]> = {
  c1: [
    {
      id: "n1",
      title: "Límites y continuidad",
      dateLabel: "hace 3 días",
      classLabel: "Clase 2",
      readMinutes: 5,
      preview:
        "Los límites son fundamentales para entender el cálculo. Cuando x se aproxima a un valor, estudiamos el comportamiento de f(x) sin necesidad de evaluar exactamente en ese punto…",
      body:
        "Los límites son fundamentales para entender el cálculo. Cuando x se aproxima a un valor, estudiamos el comportamiento de f(x) sin necesidad de evaluar exactamente en ese punto.\n\nDefinición formal: lim(x→a) f(x) = L si para todo ε > 0 existe δ > 0…",
    },
    {
      id: "n2",
      title: "Derivadas — regla de la cadena",
      dateLabel: "hace 1 día",
      classLabel: "Clase 4",
      readMinutes: 5,
      preview:
        "La regla de la cadena se aplica cuando tenemos funciones compuestas del tipo f(g(x)). La derivada es el producto de la derivada exterior evaluada en g(x) por la derivada interior…",
      body:
        "La regla de la cadena se aplica cuando tenemos funciones compuestas del tipo f(g(x)). La derivada es f'(g(x)) · g'(x).\n\nEjemplo: si h(x) = (x² + 1)³, entonces h'(x) = 3(x² + 1)² · 2x.",
    },
    {
      id: "n3",
      title: "Integrales por partes",
      dateLabel: "hace 2 horas",
      classLabel: "Clase 6",
      readMinutes: 5,
      preview:
        "La fórmula de integración por partes es: ∫u dv = uv - ∫v du. Se usa cuando el integrando es un producto de dos funciones de distinta naturaleza (algebraica y transcendente, por ejemplo)…",
      body:
        "La fórmula de integración por partes es: ∫u dv = uv - ∫v du. Se usa cuando el integrando es producto de dos funciones distintas.\n\nElegir u y dv sigue la regla LIATE para priorizar u.",
    },
    {
      id: "n4",
      title: "Repaso antes del parcial",
      dateLabel: "hace 5 días",
      classLabel: "Clase 1",
      readMinutes: 3,
      preview: "Resumen de funciones elementales y propiedades básicas del límite…",
      body: "Repaso rápido: dominio, imagen, composición y funciones inversas.",
    },
  ],
  c2: [
    {
      id: "n1",
      title: "Cinemática en 1D",
      dateLabel: "hace 1 día",
      preview: "Posición, velocidad y aceleración. Ecuaciones del MRUV…",
      body: "v = v₀ + at\nx = x₀ + v₀t + ½at²\nv² = v₀² + 2a(x - x₀)",
    },
    {
      id: "n2",
      title: "Fuerzas y diagramas",
      dateLabel: "hace 4 días",
      preview: "Ley de Newton. Diagramas de cuerpo libre en plano inclinado…",
      body: "ΣF = ma. En equilibrio ΣF = 0. Componentes en ejes x e y.",
    },
    {
      id: "n3",
      title: "Trabajo y energía",
      dateLabel: "hace 1 semana",
      preview: "Trabajo mecánico, energía cinética y potencial…",
      body: "W = F·d·cosθ. Ec = ½mv². Ep = mgh. Conservación de energía mecánica.",
    },
  ],
  c3: [
    {
      id: "n1",
      title: "Listas enlazadas",
      dateLabel: "hace 3 días",
      preview: "Implementación en Python. Inserción, eliminación y recorrido…",
      body: "class Node:\n  def __init__(self, data):\n    self.data = data\n    self.next = None",
    },
    {
      id: "n2",
      title: "Complejidad algorítmica",
      dateLabel: "hace 6 días",
      preview: "Notación O grande. Análisis de bucles anidados…",
      body: "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)",
    },
    {
      id: "n3",
      title: "API REST — diseño",
      dateLabel: "hace 2 semanas",
      preview: "Verbos HTTP, códigos de estado, recursos anidados…",
      body: "GET (leer), POST (crear), PUT/PATCH (actualizar), DELETE (eliminar). 200 OK, 201 Created, 404 Not Found.",
    },
  ],
  c4: [
    {
      id: "n1",
      title: "Ensayo argumentativo",
      dateLabel: "hace 2 días",
      preview: "Estructura: introducción, desarrollo, conclusión. Tesis clara…",
      body: "Introducción con gancho + tesis. Párrafos de desarrollo con evidencia. Conclusión que retoma la tesis.",
    },
    {
      id: "n2",
      title: "Oratoria — técnicas",
      dateLabel: "hace 1 semana",
      preview: "Contacto visual, pausas estratégicas, modulación de voz…",
      body: "Practicar frente al espejo. Grabar y revisar. Usar notas mínimas.",
    },
    {
      id: "n3",
      title: "Comunicación no verbal",
      dateLabel: "hace 2 semanas",
      preview: "Lenguaje corporal en presentaciones académicas…",
      body: "Postura abierta, gestos que acompañan (no distraen), evitar brazos cruzados.",
    },
  ],
};

const TASKS_BY_COURSE: Record<string, MockCourseTask[]> = {
  c1: [
    {
      id: "t1",
      title: "Entrega PC2 — Integrales",
      dueDate: "mié 20 may",
      done: false,
      priority: "alta",
      taskStatus: "pending",
      description: "Resolver la práctica calificada sobre integrales definidas e indefinidas.",
    },
    {
      id: "t2",
      title: "Proyecto final — Derivadas",
      dueDate: "vie 30 may",
      done: false,
      priority: "alta",
      taskStatus: "in_progress",
      progressPercent: 40,
      description: "Aplicación de derivadas a un problema de optimización con informe escrito.",
    },
    {
      id: "t3",
      title: "Taller de límites",
      dueDate: "dom 18 may",
      done: true,
      priority: "media",
      taskStatus: "completed",
      description: "Ejercicios guiados en clase sobre límites laterales.",
    },
    {
      id: "t4",
      title: "Quiz capítulo 3",
      dueDate: "jue 22 may",
      done: false,
      priority: "media",
      taskStatus: "pending",
      description: "Evaluación corta sobre continuidad y teorema del valor intermedio.",
    },
  ],
  c2: [
    { id: "t1", title: "Informe laboratorio 4", dueDate: "18 may", dueStatus: "overdue", done: false },
    { id: "t2", title: "Problemas cap. 8", dueDate: "21 may", dueStatus: "soon", done: true },
    { id: "t3", title: "Simulacro parcial", dueDate: "25 may", dueStatus: "ok", done: false },
    { id: "t4", title: "Video explicativo (5 min)", dueDate: "30 may", dueStatus: "ok", done: false },
  ],
  c3: [
    { id: "t1", title: "Proyecto API REST — entrega", dueDate: "23 may", dueStatus: "soon", done: false },
    { id: "t2", title: "Quiz capítulo 7", dueDate: "19 may", dueStatus: "overdue", done: true },
    { id: "t3", title: "Pair programming sesión 3", dueDate: "24 may", dueStatus: "ok", done: false },
    { id: "t4", title: "Documentación README", dueDate: "26 may", dueStatus: "ok", done: true },
  ],
  c4: [
    { id: "t1", title: "Ensayo 800 palabras", dueDate: "17 may", dueStatus: "overdue", done: false },
    { id: "t2", title: "Presentación oral", dueDate: "22 may", dueStatus: "soon", done: true },
    { id: "t3", title: "Análisis de discurso", dueDate: "27 may", dueStatus: "ok", done: false },
    { id: "t4", title: "Autoevaluación grupal", dueDate: "29 may", dueStatus: "ok", done: false },
  ],
};

const FILES_BY_COURSE: Record<string, MockCourseFile[]> = {
  c1: [
    {
      id: "f1",
      type: "pdf",
      name: "Silabo_Matematica_2026.pdf",
      size: "1.2 MB",
      uploadedAt: "subido hace 3 semanas",
      classLabel: "Clase 1",
    },
    {
      id: "f2",
      type: "pdf",
      name: "Ejercicios_Limites.pdf",
      size: "3.4 MB",
      uploadedAt: "subido hace 2 semanas",
      classLabel: "Clase 2",
    },
    {
      id: "f3",
      type: "image",
      name: "Formula_Derivadas.png",
      size: "890 KB",
      uploadedAt: "subido hace 1 semana",
      classLabel: "Clase 3",
    },
    {
      id: "f4",
      type: "pdf",
      name: "Apuntes_Integrales.pdf",
      size: "2.1 MB",
      uploadedAt: "subido ayer",
      classLabel: "Clase 6",
    },
  ],
  c2: [
    { id: "f1", type: "pdf", name: "Lab4_Protocolo.pdf", size: "1.1 MB", uploadedAt: "8 may" },
    { id: "f2", type: "image", name: "Diagrama_fuerzas.jpg", size: "520 KB", uploadedAt: "14 may" },
    { id: "f3", type: "pdf", name: "Formulas_referencia.pdf", size: "156 KB", uploadedAt: "1 abr" },
  ],
  c3: [
    { id: "f1", type: "pdf", name: "Especificacion_API.pdf", size: "3.2 MB", uploadedAt: "6 may" },
    { id: "f2", type: "pdf", name: "Guia_Git.pdf", size: "780 KB", uploadedAt: "20 abr" },
    { id: "f3", type: "image", name: "Arquitectura_diagrama.png", size: "1.8 MB", uploadedAt: "11 may" },
  ],
  c4: [
    { id: "f1", type: "pdf", name: "Rubrica_ensayo.pdf", size: "420 KB", uploadedAt: "3 may" },
    { id: "f2", type: "pdf", name: "Plantilla_presentacion.pdf", size: "2.1 MB", uploadedAt: "15 abr" },
    { id: "f3", type: "image", name: "Infografia_comunicacion.png", size: "960 KB", uploadedAt: "9 may" },
  ],
};

const QUIZZES_BY_COURSE: Record<string, MockCourseQuiz[]> = {
  c1: [
    { id: "q1", title: "Quiz: Límites básicos", status: "completed", score: "9/10", date: "hace 1 semana" },
    { id: "q2", title: "Quiz: Derivadas", status: "completed", score: "7/10", date: "hace 3 días" },
    { id: "q3", title: "Quiz capítulo 6", status: "completed", score: "4/10", date: "hace 1 día" },
  ],
  c2: [
    { id: "q1", title: "Quiz: Cinemática", status: "completed", score: "9/10", date: "8 may" },
    { id: "q2", title: "Quiz: Dinámica", status: "pending", date: "24 may" },
  ],
  c3: [
    { id: "q1", title: "Quiz: Estructuras de datos", status: "completed", score: "7/10", date: "5 may" },
    { id: "q2", title: "Quiz: Algoritmos", status: "pending", date: "26 may" },
  ],
  c4: [
    { id: "q1", title: "Quiz: Retórica clásica", status: "completed", score: "10/10", date: "2 may" },
    { id: "q2", title: "Quiz: Comunicación escrita", status: "pending", date: "20 may" },
  ],
};

export function getCoursesForList(): MockCourseExtended[] {
  if (isMockCoursesEnabled()) return MOCK_COURSES_EXTENDED;
  return loadPersistedStudentCourses().map(persistedToExtended);
}

export function getCourseById(id: string): MockCourseExtended | undefined {
  if (isMockCoursesEnabled()) return MOCK_COURSES_EXTENDED.find((c) => c.id === id);
  return loadPersistedStudentCourses().map(persistedToExtended).find((c) => c.id === id);
}

export function getCourseNotes(courseId: string): MockCourseNote[] {
  return NOTES_BY_COURSE[courseId] ?? [];
}

export function getCourseTasks(courseId: string): MockCourseTask[] {
  return TASKS_BY_COURSE[courseId] ?? [];
}

export function getCourseFiles(courseId: string): MockCourseFile[] {
  return FILES_BY_COURSE[courseId] ?? [];
}

export function getCourseQuizzes(courseId: string): MockCourseQuiz[] {
  return QUIZZES_BY_COURSE[courseId] ?? [];
}
