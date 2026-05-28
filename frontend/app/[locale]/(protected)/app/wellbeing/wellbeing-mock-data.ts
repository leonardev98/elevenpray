import type {
  BreathingExercise,
  MoodFactorId,
  MoodHeatmapCell,
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

export const LIZYY_MOOD_MESSAGES: Record<MoodId, string> = {
  excellent:
    "Qué energía la tuya hoy. Aprovecha este impulso para avanzar algo que hayas postergado.",
  good: "Buen estado para estudiar con constancia. Sin presión, a tu ritmo.",
  normal: "Días normales también cuentan. Una sesión corta hoy mantiene el ritmo.",
  low: "Entiendo. A veces el cuerpo necesita ir despacio. Una respiración corta puede ayudar.",
  bad: "Hoy descansa si lo necesitas. Tu bienestar va primero que cualquier parcial.",
};

export const LISYY_FACTOR_MESSAGES: Partial<
  Record<MoodFactorId, Partial<Record<MoodId, string>>>
> = {
  sleepBad: {
    bad: "El sueño afecta mucho el ánimo. Hoy ve suave, una sesión corta basta. Lisyy cuida de ti.",
    low: "Dormir poco pesa en el cuerpo. Prioriza descanso antes de exigirte más.",
  },
  sleepGood: {
    excellent: "Dormir bien se nota. Aprovecha esta claridad con calma, sin quemarte.",
    good: "Buen descanso, buen ánimo. Un bloque de estudio enfocado te vendría bien.",
  },
  examNear: {
    low: "Los parciales acercan la presión. Respira antes de abrir los apuntes.",
    normal: "Parcial cerca: divide en tareas pequeñas y celebra cada avance.",
  },
  heavyLoad: {
    low: "Mucha carga encima. No tienes que resolverlo todo hoy.",
    bad: "La sobrecarga agota. Pide ayuda o reduce el plan de hoy.",
  },
  calmDay: {
    good: "Un día tranquilo es oro. Úsalo para avanzar sin prisa.",
    normal: "Día tranquilo: buen momento para repasar sin presión.",
  },
  personalIssues: {
    bad: "Los problemas personales pesan. Está bien ir despacio hoy.",
    low: "Lo personal importa más que cualquier nota. Cuídate primero.",
  },
  exercise: {
    excellent: "El ejercicio te dio energía. Canalízala con una sesión corta y enfocada.",
    good: "Mover el cuerpo ayuda a la mente. Buen momento para estudiar.",
  },
};

export function getLisyyMessage(mood: MoodId, factors: MoodFactorId[]): string {
  for (const factor of factors) {
    const override = LISYY_FACTOR_MESSAGES[factor]?.[mood];
    if (override) return override;
  }
  return LIZYY_MOOD_MESSAGES[mood];
}

export const MOOD_FACTORS: { id: MoodFactorId; labelKey: string }[] = [
  { id: "sleepGood", labelKey: "sleepGood" },
  { id: "sleepBad", labelKey: "sleepBad" },
  { id: "examNear", labelKey: "examNear" },
  { id: "heavyLoad", labelKey: "heavyLoad" },
  { id: "calmDay", labelKey: "calmDay" },
  { id: "personalIssues", labelKey: "personalIssues" },
  { id: "exercise", labelKey: "exercise" },
];

export const WELLBEING_TIP_IDS = [
  "studyBlocks",
  "water",
  "sleep",
  "walk",
  "stretch",
  "screenBreak",
  "gratitude",
  "breathing",
] as const;

export type WellbeingTipId = (typeof WELLBEING_TIP_IDS)[number];

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

export const QUICK_PAUSE_EXERCISE: BreathingExercise = {
  id: "quick-pause",
  title: "Pausa rápida",
  durationLabel: "1 min",
  totalMinutes: 1,
  phases: [
    { label: "Inhala", type: "inhale", seconds: 4 },
    { label: "Exhala", type: "exhale", seconds: 4 },
  ],
};

const MOOD_MOOD_LABELS: Record<MoodId, string> = {
  excellent: "Excelente",
  good: "Bien",
  normal: "Normal",
  low: "Medio mal",
  bad: "Mal",
};

export function getMoodLabel(mood: MoodId): string {
  return MOOD_MOOD_LABELS[mood];
}

function generateMoodHeatmapData(): MoodHeatmapCell[] {
  const moods: MoodId[] = ["excellent", "good", "normal", "low", "bad"];
  const data: MoodHeatmapCell[] = [];
  for (let week = 0; week < 10; week++) {
    for (let day = 0; day < 7; day++) {
      const isWeekend = day >= 5;
      const isRecent = week >= 7;
      const isMid = week >= 4 && week < 7;

      if (isWeekend && !isRecent) {
        data.push(null);
        continue;
      }
      if (isWeekend && isRecent && day === 6) {
        data.push(null);
        continue;
      }

      let moodIndex: number;
      if (isRecent) {
        moodIndex = day === 3 ? 0 : day === 2 ? 3 : day === 4 ? 1 : 2;
      } else if (isMid) {
        moodIndex = day < 3 ? 2 : day === 3 ? 1 : 3;
      } else {
        moodIndex = day < 4 ? 2 : 3;
      }
      if (!isWeekend && week % 3 === day % 3 && moodIndex > 0) {
        moodIndex -= 1;
      }
      data.push(moods[moodIndex] ?? "normal");
    }
  }
  return data;
}

export const MOOD_HEATMAP_DATA = generateMoodHeatmapData();

export const HEATMAP_DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export const WEEK_MOODS: { day: string; mood: WeekMoodId }[] = [
  { day: "L", mood: "good" },
  { day: "M", mood: "normal" },
  { day: "X", mood: "low" },
  { day: "J", mood: "excellent" },
  { day: "V", mood: "good" },
  { day: "S", mood: null },
  { day: "D", mood: null },
];

export const WEEK_BEST_DAY_INDEX = 3;

export type WeekEmotionalTrend = "stable" | "up" | "down";

export const WEEK_EMOTIONAL_TREND: WeekEmotionalTrend = "stable";

export type CorrelationInsightIcon = "TrendingUp" | "Moon" | "Flame";

export const CORRELATION_INSIGHTS: {
  id: string;
  icon: CorrelationInsightIcon;
  bodyKey: string;
}[] = [
  { id: "study-mood", icon: "TrendingUp", bodyKey: "insight1" },
  { id: "sleep-mood", icon: "Moon", bodyKey: "insight2" },
  { id: "streak-care", icon: "Flame", bodyKey: "insight3" },
];

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

export { POMODORO_PRESETS, TOTAL_POMODORO_ROUNDS } from "../pomodoro/pomodoro-data";
