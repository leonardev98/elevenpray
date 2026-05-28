"use client";

import { useCallback } from "react";
import { usePomodoro as useGlobalPomodoro } from "../../pomodoro/pomodoro-context";
import { POMODORO_PRESETS } from "../../pomodoro/pomodoro-data";
import { formatPomodoroTime } from "../../pomodoro/usePomodoroTimer";

export function usePomodoro() {
  const global = useGlobalPomodoro();

  const focusSeconds = POMODORO_PRESETS[global.presetIndex].seconds;
  const displayTotalSeconds =
    global.enabled && global.phase === "break" ? global.totalSeconds : focusSeconds;
  const progress =
    global.enabled && global.phase === "break"
      ? 1 - global.secondsLeft / global.totalSeconds
      : 1 - global.secondsLeft / focusSeconds;

  const sessionComplete =
    global.enabled &&
    global.phase === "break" &&
    global.completedFocusSessions > 0 &&
    !global.allRoundsDone;

  const toggleRunning = useCallback(() => {
    global.toggleRunning();
  }, [global]);

  const selectPreset = useCallback(
    (index: number) => {
      global.selectPreset(index);
    },
    [global],
  );

  return {
    presetIndex: global.presetIndex,
    presets: global.presets,
    secondsLeft: global.secondsLeft,
    totalSeconds: displayTotalSeconds,
    focusSeconds,
    isRunning: global.enabled && global.isRunning,
    enabled: global.enabled,
    phase: global.phase,
    completedRounds: global.completedFocusSessions,
    currentRound: global.currentRound,
    totalRounds: global.totalRounds,
    progress,
    sessionComplete,
    allRoundsDone: global.allRoundsDone,
    selectPreset,
    toggleRunning,
    reset: global.reset,
    activate: global.activate,
  };
}

export { formatPomodoroTime as formatTime };
