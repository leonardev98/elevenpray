export type MoodId = "excellent" | "good" | "normal" | "low" | "bad";

export type MoodFactorId =
  | "sleepGood"
  | "sleepBad"
  | "examNear"
  | "heavyLoad"
  | "calmDay"
  | "personalIssues"
  | "exercise";

export type MoodHeatmapCell = MoodId | null;

export type BreathingPhaseType = "inhale" | "hold" | "exhale";

export type BreathingExerciseId =
  | "four-seven-eight"
  | "box"
  | "calm"
  | "quick-pause";

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

/** @deprecated Use MoodHeatmapCell */
export type HeatmapLevel = 0 | 1 | 2 | 3;

export type WeekMoodId = MoodId | null;
