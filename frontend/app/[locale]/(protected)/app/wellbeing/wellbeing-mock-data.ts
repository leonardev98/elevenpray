import type {
  BreathingExercise,
  HeatmapLevel,
  MoodId,
  ResourceItem,
  WeekMoodId,
} from "./wellbeing-types";

export const DAILY_QUOTES = [
  "El descanso no es rendirse — es recargar.",
  "Un paso pequeño hoy vale más que un plan perfecto mañana.",
  "Tu mente también necesita pausas para rendir bien.",
  "Estudiar con calma es estudiar con más claridad.",
  "No tienes que sentirte bien para empezar — solo empezar.",
];

export const MOOD_MESSAGES: Record<MoodId, string> = {
  excellent:
    "¡Qué buena energía! Aprovéchala para estudiar algo retador hoy.",
  good: "Buen día para avanzar con constancia. Sin presión.",
  normal: "Día neutral — eso también está bien. Un paso a la vez.",
  low: "Nota que algo te pesa. Considera una pausa antes de estudiar.",
  bad: "Está bien no estar bien. Hoy descansa primero, estudia después.",
};

export const MOOD_OPTIONS: {
  id: MoodId;
  label: string;
}[] = [
  { id: "excellent", label: "Excelente" },
  { id: "good", label: "Bien" },
  { id: "normal", label: "Normal" },
  { id: "low", label: "Medio mal" },
  { id: "bad", label: "Mal" },
];

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: "four-seven-eight",
    title: "Respiración 4-7-8",
    durationLabel: "3 min",
    totalMinutes: 3,
    phases: [
      { label: "Inhala", type: "inhale", seconds: 4 },
      { label: "Sostén", type: "hold", seconds: 7 },
      { label: "Exhala", type: "exhale", seconds: 8 },
      { label: "Sostén", type: "hold", seconds: 4 },
    ],
  },
  {
    id: "box",
    title: "Caja de respiración",
    durationLabel: "4 min",
    totalMinutes: 4,
    phases: [
      { label: "Inhala", type: "inhale", seconds: 4 },
      { label: "Sostén", type: "hold", seconds: 4 },
      { label: "Exhala", type: "exhale", seconds: 4 },
      { label: "Sostén", type: "hold", seconds: 4 },
    ],
  },
  {
    id: "calm",
    title: "Respiración de calma",
    durationLabel: "2 min",
    totalMinutes: 2,
    phases: [
      { label: "Inhala", type: "inhale", seconds: 4 },
      { label: "Exhala", type: "exhale", seconds: 6 },
    ],
  },
];

/** 10 semanas × 7 días (L–D). Más actividad en semanas recientes; fines de semana más bajos. */
function generateHeatmapData(): HeatmapLevel[] {
  const data: HeatmapLevel[] = [];
  for (let week = 0; week < 10; week++) {
    for (let day = 0; day < 7; day++) {
      const isWeekend = day >= 5;
      const isRecent = week >= 7;
      const isMid = week >= 4 && week < 7;

      let level: HeatmapLevel = 0;
      if (isWeekend) {
        level = isRecent ? 1 : 0;
      } else if (isRecent) {
        level = ([2, 3, 3, 2, 3, 1, 1] as HeatmapLevel[])[day] ?? 2;
      } else if (isMid) {
        level = ([1, 2, 2, 1, 2, 0, 0] as HeatmapLevel[])[day] ?? 1;
      } else {
        level = day < 5 ? 1 : 0;
      }
      // Pseudo-variación por semana
      if (!isWeekend && week % 3 === day % 3) {
        level = Math.min(3, (level + 1) as HeatmapLevel) as HeatmapLevel;
      }
      data.push(level);
    }
  }
  return data;
}

export const HEATMAP_DATA = generateHeatmapData();

export const HEATMAP_DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export const HEATMAP_STATS = {
  currentStreak: 12,
  bestStreak: 21,
  activeDaysThisMonth: 18,
};

export const SESSION_LABELS: Record<HeatmapLevel, string> = {
  0: "sin sesiones",
  1: "1 sesión",
  2: "2 sesiones",
  3: "3 sesiones",
};

export const WEEK_MOODS: { day: string; mood: WeekMoodId }[] = [
  { day: "L", mood: "good" },
  { day: "M", mood: "normal" },
  { day: "X", mood: "low" },
  { day: "J", mood: "excellent" },
  { day: "V", mood: "good" },
  { day: "S", mood: null },
  { day: "D", mood: null },
];

export const WEEK_INSIGHT =
  "Tu mejor día fue el jueves. Tendencia: estable esta semana.";

export const RESOURCES: ResourceItem[] = [
  {
    id: "r1",
    title: "Técnica 5-4-3-2-1 para la ansiedad",
    readTime: "6 min de lectura",
    tag: "Ansiedad",
    tagColor: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)]",
    icon: "BookHeart",
  },
  {
    id: "r2",
    title: "Cómo estudiar sin agotarte",
    readTime: "4 min de lectura",
    tag: "Productividad",
    tagColor: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)]",
    icon: "BarChart2",
  },
  {
    id: "r3",
    title: "Dormir bien antes de un examen",
    readTime: "5 min de lectura",
    tag: "Descanso",
    tagColor: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)]",
    icon: "Moon",
  },
  {
    id: "r4",
    title: "Qué hacer cuando te bloqueas",
    readTime: "3 min de lectura",
    tag: "Bloqueo mental",
    tagColor: "bg-[var(--course-2-bg)] text-[var(--course-2-fg)]",
    icon: "Zap",
  },
];

export const POMODORO_PRESETS = [
  { id: "study", label: "25 min", seconds: 25 * 60 },
  { id: "short", label: "15 min", seconds: 15 * 60 },
  { id: "break", label: "5 min", seconds: 5 * 60 },
] as const;

export const TOTAL_POMODORO_ROUNDS = 4;
