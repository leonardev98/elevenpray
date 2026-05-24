/** Mocks solo para la vista detalle de curso (clases, flashcards, quizzes enriquecidos). */

export type MockCourseClassSession = {
  id: string;
  number: number;
  title: string;
  dateLine: string;
  timeRange: string;
  notesCount: number;
  flashcardsCount: number;
  completed: boolean;
  linkedNoteTitles: string[];
};

export type MockFlashcard = {
  id: string;
  question: string;
  answer: string;
  classLabel: string;
  /** 0 = sin clase; número de clase para compatibilidad */
  classFilter: number;
  /** Entrada animada al crear desde la UI */
  nueva?: boolean;
  classId?: number | null;
};

export type MockQuizHistoryQuestion = {
  id: string;
  prompt: string;
  correct: boolean;
};

export type MockQuizHistoryItem = {
  id: string;
  title: string;
  completedAt: string;
  classesLine: string;
  scoreLabel: string;
  percent: number;
  passed: boolean;
  questions: MockQuizHistoryQuestion[];
};

export type MockQuizActive = {
  title: string;
  subtitle: string;
  difficultyFilled: number;
  questionCount: number;
  minutesEstimate: number;
};

export type MockQuizQuestion = {
  id: string;
  number: number;
  prompt: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string;
};

const CLASSES_C1: MockCourseClassSession[] = [
  {
    id: "cl1",
    number: 1,
    title: "Introducción al Cálculo",
    dateLine: "Lunes 5 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 2,
    flashcardsCount: 0,
    completed: true,
    linkedNoteTitles: ["Repaso de funciones", "Notación de límites"],
  },
  {
    id: "cl2",
    number: 2,
    title: "Límites y Continuidad",
    dateLine: "Viernes 9 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 1,
    flashcardsCount: 3,
    completed: true,
    linkedNoteTitles: ["Límites y continuidad"],
  },
  {
    id: "cl3",
    number: 3,
    title: "Derivadas básicas",
    dateLine: "Miércoles 13 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 1,
    flashcardsCount: 0,
    completed: true,
    linkedNoteTitles: ["Reglas de derivación"],
  },
  {
    id: "cl4",
    number: 4,
    title: "Regla de la cadena",
    dateLine: "Lunes 19 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 1,
    flashcardsCount: 2,
    completed: true,
    linkedNoteTitles: ["Derivadas — regla de la cadena"],
  },
  {
    id: "cl5",
    number: 5,
    title: "Integrales indefinidas",
    dateLine: "Viernes 23 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 0,
    flashcardsCount: 0,
    completed: false,
    linkedNoteTitles: [],
  },
  {
    id: "cl6",
    number: 6,
    title: "Integrales definidas",
    dateLine: "Miércoles 27 mayo",
    timeRange: "8:00 - 10:00",
    notesCount: 0,
    flashcardsCount: 0,
    completed: false,
    linkedNoteTitles: [],
  },
];

const FLASHCARDS_C1: MockFlashcard[] = [
  {
    id: "fc1",
    question: "¿Qué es un límite?",
    answer: "El valor al que se aproxima f(x) cuando x tiende a un punto",
    classLabel: "Clase 2",
    classFilter: 2,
  },
  {
    id: "fc2",
    question: "¿Cuándo una función es continua?",
    answer: "Cuando existe el límite y es igual al valor de la función en ese punto",
    classLabel: "Clase 2",
    classFilter: 2,
  },
  {
    id: "fc3",
    question: "Derivada de xⁿ",
    answer: "nxⁿ⁻¹",
    classLabel: "Clase 3",
    classFilter: 3,
  },
  {
    id: "fc4",
    question: "Regla de la cadena",
    answer: "[f(g(x))]' = f'(g(x)) · g'(x)",
    classLabel: "Clase 4",
    classFilter: 4,
  },
  {
    id: "fc5",
    question: "¿Qué significa la derivada geométricamente?",
    answer: "La pendiente de la recta tangente a la curva en ese punto",
    classLabel: "Clase 3",
    classFilter: 3,
  },
  {
    id: "fc6",
    question: "Integral de xⁿ",
    answer: "xⁿ⁺¹/(n+1) + C",
    classLabel: "Clase 6",
    classFilter: 6,
  },
  {
    id: "fc7",
    question: "Integración por partes",
    answer: "∫u dv = uv - ∫v du",
    classLabel: "Clase 6",
    classFilter: 6,
  },
  {
    id: "fc8",
    question: "¿Cuándo usar integración por partes?",
    answer: "Cuando el integrando es producto de dos funciones distintas",
    classLabel: "Clase 6",
    classFilter: 6,
  },
];

export const QUIZ_ACTIVE_C1: MockQuizActive = {
  title: "Quiz: Derivadas e Integrales",
  subtitle: "10 preguntas · ~15 min · Clases 3, 4 y 6",
  difficultyFilled: 3,
  questionCount: 10,
  minutesEstimate: 15,
};

export const QUIZ_ACTIVE_QUESTIONS_C1: MockQuizQuestion[] = [
  {
    id: "qq1",
    number: 1,
    prompt: "¿Cuál es la derivada de x³?",
    options: [
      { id: "A", label: "A", text: "3x" },
      { id: "B", label: "B", text: "3x²" },
      { id: "C", label: "C", text: "x²" },
      { id: "D", label: "D", text: "2x" },
    ],
    correctOptionId: "B",
  },
  {
    id: "qq2",
    number: 2,
    prompt: "¿Qué es una integral definida?",
    options: [
      { id: "A", label: "A", text: "Área bajo la curva" },
      { id: "B", label: "B", text: "Pendiente" },
      { id: "C", label: "C", text: "Límite" },
      { id: "D", label: "D", text: "Derivada" },
    ],
    correctOptionId: "A",
  },
  {
    id: "qq3",
    number: 3,
    prompt: "Resultado de ∫2x dx",
    options: [
      { id: "A", label: "A", text: "x" },
      { id: "B", label: "B", text: "x² + C" },
      { id: "C", label: "C", text: "2x²" },
      { id: "D", label: "D", text: "x/2" },
    ],
    correctOptionId: "B",
  },
];

const QUIZ_HISTORY_C1: MockQuizHistoryItem[] = [
  {
    id: "qh1",
    title: "Quiz: Límites básicos",
    completedAt: "hace 1 semana",
    classesLine: "Clase 2",
    scoreLabel: "9/10",
    percent: 90,
    passed: true,
    questions: [
      { id: "q1", prompt: "Definición informal de límite", correct: true },
      { id: "q2", prompt: "Continuidad en un punto", correct: true },
      { id: "q3", prompt: "Límite lateral", correct: false },
    ],
  },
  {
    id: "qh2",
    title: "Quiz: Derivadas",
    completedAt: "hace 3 días",
    classesLine: "Clases 3-4",
    scoreLabel: "7/10",
    percent: 70,
    passed: true,
    questions: [
      { id: "q1", prompt: "Regla del producto", correct: true },
      { id: "q2", prompt: "Derivada de sin(x)", correct: false },
    ],
  },
  {
    id: "qh3",
    title: "Quiz capítulo 6",
    completedAt: "hace 1 día",
    classesLine: "Clase 6",
    scoreLabel: "4/10",
    percent: 40,
    passed: false,
    questions: [
      { id: "q1", prompt: "Integración por partes", correct: false },
      { id: "q2", prompt: "Sustitución simple", correct: true },
    ],
  },
];

const CLASSES_BY_COURSE: Record<string, MockCourseClassSession[]> = {
  c1: CLASSES_C1,
};

const FLASHCARDS_BY_COURSE: Record<string, MockFlashcard[]> = {
  c1: FLASHCARDS_C1,
};

const QUIZ_HISTORY_BY_COURSE: Record<string, MockQuizHistoryItem[]> = {
  c1: QUIZ_HISTORY_C1,
};

export function getCourseClasses(courseId: string): MockCourseClassSession[] {
  return CLASSES_BY_COURSE[courseId] ?? [];
}

export function getCourseFlashcards(courseId: string): MockFlashcard[] {
  return FLASHCARDS_BY_COURSE[courseId] ?? [];
}

export function getCourseQuizHistoryDetailed(courseId: string): MockQuizHistoryItem[] {
  return QUIZ_HISTORY_BY_COURSE[courseId] ?? [];
}
