export type MoodId = "excellent" | "good" | "normal" | "low" | "bad";

export type BreathingPhaseType = "inhale" | "hold" | "exhale";

export type BreathingExerciseId = "four-seven-eight" | "box" | "calm";

export interface BreathingPhase {
  label: string;
  type: BreathingPhaseType;
  seconds: number;
}

export interface BreathingExercise {
  id: BreathingExerciseId;
  title: string;
  durationLabel: string;
  totalMinutes: number;
  phases: BreathingPhase[];
}

export interface ResourceItem {
  id: string;
  title: string;
  readTime: string;
  tag: string;
  tagColor: string;
  icon: "BookHeart" | "BarChart2" | "Moon" | "Zap";
}

export type HeatmapLevel = 0 | 1 | 2 | 3;

export type WeekMoodId = MoodId | null;
