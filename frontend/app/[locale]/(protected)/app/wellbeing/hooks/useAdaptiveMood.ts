import { useState, useEffect } from "react";
import type { MoodId } from "../wellbeing-types";

export interface AdaptiveConfig {
  pomodoroDefaultMinutes: number;
  showBreathingFirst: boolean;
  reduceVisualStimuli: boolean;
  gentleFocusMode: boolean;
  reducePressure: boolean;
  customMessage: string | null;
}

const DEFAULT_CONFIG: AdaptiveConfig = {
  pomodoroDefaultMinutes: 25,
  showBreathingFirst: false,
  reduceVisualStimuli: false,
  gentleFocusMode: false,
  reducePressure: false,
  customMessage: null,
};

const MOOD_CONFIGS: Record<MoodId, AdaptiveConfig> = {
  excellent: {
    pomodoroDefaultMinutes: 25,
    showBreathingFirst: false,
    reduceVisualStimuli: false,
    gentleFocusMode: false,
    reducePressure: false,
    customMessage: null,
  },
  good: {
    pomodoroDefaultMinutes: 25,
    showBreathingFirst: false,
    reduceVisualStimuli: false,
    gentleFocusMode: false,
    reducePressure: false,
    customMessage: null,
  },
  normal: {
    pomodoroDefaultMinutes: 25,
    showBreathingFirst: false,
    reduceVisualStimuli: false,
    gentleFocusMode: false,
    reducePressure: false,
    customMessage: null,
  },
  low: {
    pomodoroDefaultMinutes: 20,
    showBreathingFirst: true,
    reduceVisualStimuli: true,
    gentleFocusMode: true,
    reducePressure: true,
    customMessage: "Hoy no necesitas hacerlo perfecto. Solo avanzar un poco.",
  },
  bad: {
    pomodoroDefaultMinutes: 15,
    showBreathingFirst: true,
    reduceVisualStimuli: true,
    gentleFocusMode: true,
    reducePressure: true,
    customMessage: "Está bien no estar bien. Prioriza tu bienestar hoy. Un pequeño paso es suficiente.",
  },
};

export function useAdaptiveMood(initialMood: MoodId = "good") {
  const [currentMood, setCurrentMood] = useState<MoodId>(initialMood);
  const [config, setConfig] = useState<AdaptiveConfig>(MOOD_CONFIGS[initialMood]);

  useEffect(() => {
    setConfig(MOOD_CONFIGS[currentMood]);
  }, [currentMood]);

  const updateMood = (mood: MoodId) => {
    setCurrentMood(mood);
  };

  return {
    currentMood,
    config,
    updateMood,
    isGentleMode: config.gentleFocusMode,
  };
}
