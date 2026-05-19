import { MOCK_COURSES, type MockCourse } from "./mock-student-data";

export type CourseAccent = "violet" | "teal" | "amber" | "rose" | "sky" | "emerald";

export type MockCourseExtended = MockCourse & {
  accent: CourseAccent;
  classDays: string[];
  progressPercent: number;
  weeksCurrent: number;
  weeksTotal: number;
  streakDays: number;
};

export type MockCourseNote = {
  id: string;
  title: string;
  dateLabel: string;
  preview: string;
  body: string;
};

export type TaskDueStatus = "overdue" | "soon" | "ok";

export type MockCourseTask = {
  id: string;
  title: string;
  dueDate: string;
  dueStatus: TaskDueStatus;
  done: boolean;
};

export type MockCourseFile = {
  id: string;
  type: "pdf" | "image";
  name: string;
  size: string;
  uploadedAt: string;
};

export type MockCourseQuiz = {
  id: string;
  title: string;
  status: "completed" | "pending";
  score?: string;
  date: string;
};

/** Cambiar a true para probar el estado vacío en la lista */
export const SHOW_COURSES_EMPTY = false;

export const MOCK_COURSES_EXTENDED: MockCourseExtended[] = [
  {
    ...MOCK_COURSES[0],
    accent: "teal",
    classDays: ["Lunes", "Miércoles", "Viernes"],
    progressPercent: 45,
    weeksCurrent: 6,
    weeksTotal: 16,
    streakDays: 12,
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
      dateLabel: "hace 2 días",
      preview:
        "Definición formal de límite. Teorema del sándwich y continuidad en intervalos cerrados…",
      body:
        "Definición formal de límite:\n\nlim(x→a) f(x) = L significa que para todo ε > 0 existe δ > 0 tal que si 0 < |x - a| < δ entonces |f(x) - L| < ε.\n\nTeorema del sándwich: si g(x) ≤ f(x) ≤ h(x) y lim g = lim h = L, entonces lim f = L.",
    },
    {
      id: "n2",
      title: "Derivadas — reglas básicas",
      dateLabel: "hace 5 días",
      preview:
        "Regla del producto, cociente y cadena. Ejemplos con funciones trigonométricas…",
      body:
        "Regla del producto: (fg)' = f'g + fg'\nRegla del cociente: (f/g)' = (f'g - fg') / g²\nRegla de la cadena: (f∘g)' = f'(g(x)) · g'(x)",
    },
    {
      id: "n3",
      title: "Integrales definidas",
      dateLabel: "hace 1 semana",
      preview:
        "Teorema fundamental del cálculo. Partes 1 y 2. Área bajo la curva…",
      body:
        "Teorema fundamental del cálculo:\n\nSi F es una antiderivada de f en [a,b], entonces ∫ₐᵇ f(x)dx = F(b) - F(a).",
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
    { id: "t1", title: "Entrega PC2 — Integrales", dueDate: "15 may", dueStatus: "overdue", done: true },
    { id: "t2", title: "Ejercicios cap. 5 (pág. 120-135)", dueDate: "20 may", dueStatus: "soon", done: true },
    { id: "t3", title: "Leer sílabo unidad 6", dueDate: "22 may", dueStatus: "ok", done: false },
    { id: "t4", title: "Preparar exposición grupal", dueDate: "28 may", dueStatus: "ok", done: false },
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
    { id: "f1", type: "pdf", name: "Sílabo_Calculo_I.pdf", size: "2.4 MB", uploadedAt: "12 abr" },
    { id: "f2", type: "pdf", name: "PC2_Enunciado.pdf", size: "890 KB", uploadedAt: "5 may" },
    { id: "f3", type: "image", name: "Grafico_limites.png", size: "340 KB", uploadedAt: "10 may" },
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
    { id: "q1", title: "Quiz: Derivadas básicas", status: "completed", score: "8/10", date: "10 may" },
    { id: "q2", title: "Quiz: Límites", status: "pending", date: "22 may" },
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

const DEFAULT_COURSE_ID = "c1";

export function getCoursesForList(): MockCourseExtended[] {
  return SHOW_COURSES_EMPTY ? [] : MOCK_COURSES_EXTENDED;
}

export function getCourseById(id: string): MockCourseExtended | undefined {
  return MOCK_COURSES_EXTENDED.find((c) => c.id === id);
}

export function getCourseNotes(courseId: string): MockCourseNote[] {
  return NOTES_BY_COURSE[courseId] ?? NOTES_BY_COURSE[DEFAULT_COURSE_ID];
}

export function getCourseTasks(courseId: string): MockCourseTask[] {
  return TASKS_BY_COURSE[courseId] ?? TASKS_BY_COURSE[DEFAULT_COURSE_ID];
}

export function getCourseFiles(courseId: string): MockCourseFile[] {
  return FILES_BY_COURSE[courseId] ?? FILES_BY_COURSE[DEFAULT_COURSE_ID];
}

export function getCourseQuizzes(courseId: string): MockCourseQuiz[] {
  return QUIZZES_BY_COURSE[courseId] ?? QUIZZES_BY_COURSE[DEFAULT_COURSE_ID];
}
