"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  POMODORO_BREAK_SECONDS,
  POMODORO_PRESETS,
  TOTAL_POMODORO_ROUNDS,
} from "./pomodoro-data";

export type PomodoroPhase = "focus" | "break";

export function formatPomodoroTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function usePomodoroTimer(onBreakStart?: () => void) {
  const [enabled, setEnabled] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_PRESETS[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const phaseRef = useRef(phase);
  const presetIndexRef = useRef(presetIndex);
  const completedRef = useRef(completedFocusSessions);
  const onBreakStartRef = useRef(onBreakStart);
  phaseRef.current = phase;
  presetIndexRef.current = presetIndex;
  completedRef.current = completedFocusSessions;
  onBreakStartRef.current = onBreakStart;

  const audioCtxRef = useRef<AudioContext | null>(null);

  const focusSeconds = POMODORO_PRESETS[presetIndex].seconds;
  const totalSeconds = phase === "focus" ? focusSeconds : POMODORO_BREAK_SECONDS;
  const progress = enabled ? 1 - secondsLeft / totalSeconds : 1 - secondsLeft / focusSeconds;
  const currentRound = Math.min(completedFocusSessions + 1, TOTAL_POMODORO_ROUNDS);
  const allRoundsDone = completedFocusSessions >= TOTAL_POMODORO_ROUNDS;

  const playBeep = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      osc.frequency.value = 440;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* audio no disponible */
    }
  }, []);

  const activate = useCallback(() => {
    const seconds = POMODORO_PRESETS[presetIndexRef.current].seconds;
    setEnabled(true);
    setPhase("focus");
    phaseRef.current = "focus";
    setSecondsLeft(seconds);
    setCompletedFocusSessions(0);
    completedRef.current = 0;
    setIsRunning(true);
  }, []);

  const deactivate = useCallback(() => {
    setEnabled(false);
    setIsRunning(false);
    setPhase("focus");
    phaseRef.current = "focus";
    setSecondsLeft(POMODORO_PRESETS[presetIndexRef.current].seconds);
    setCompletedFocusSessions(0);
    completedRef.current = 0;
  }, []);

  const toggleRunning = useCallback(() => {
    if (!enabled) {
      activate();
      return;
    }
    setIsRunning((r) => !r);
  }, [enabled, activate]);

  const selectPreset = useCallback(
    (index: number) => {
      setPresetIndex(index);
      presetIndexRef.current = index;
      setIsRunning(false);
      if (phaseRef.current === "focus" || !enabled) {
        setSecondsLeft(POMODORO_PRESETS[index].seconds);
      }
    },
    [enabled],
  );

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase("focus");
    phaseRef.current = "focus";
    setSecondsLeft(POMODORO_PRESETS[presetIndexRef.current].seconds);
    setCompletedFocusSessions(0);
    completedRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled || !isRunning || allRoundsDone) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        playBeep();

        if (phaseRef.current === "focus") {
          const nextCompleted = completedRef.current + 1;
          completedRef.current = nextCompleted;
          setCompletedFocusSessions(nextCompleted);

          if (nextCompleted >= TOTAL_POMODORO_ROUNDS) {
            setIsRunning(false);
            setEnabled(false);
            setPhase("focus");
            phaseRef.current = "focus";
            return POMODORO_PRESETS[presetIndexRef.current].seconds;
          }

          onBreakStartRef.current?.();
          setPhase("break");
          phaseRef.current = "break";
          return POMODORO_BREAK_SECONDS;
        }

        setPhase("focus");
        phaseRef.current = "focus";
        return POMODORO_PRESETS[presetIndexRef.current].seconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, isRunning, allRoundsDone, playBeep]);

  return {
    enabled,
    presetIndex,
    phase,
    secondsLeft,
    focusSeconds,
    totalSeconds,
    isRunning,
    completedFocusSessions,
    currentRound,
    totalRounds: TOTAL_POMODORO_ROUNDS,
    allRoundsDone,
    progress,
    activate,
    deactivate,
    toggleRunning,
    selectPreset,
    reset,
    presets: POMODORO_PRESETS,
  };
}
