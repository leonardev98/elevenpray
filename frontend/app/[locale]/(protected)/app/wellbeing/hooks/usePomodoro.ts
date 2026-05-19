"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { POMODORO_PRESETS, TOTAL_POMODORO_ROUNDS } from "../wellbeing-mock-data";

export function usePomodoro() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_PRESETS[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalSeconds = POMODORO_PRESETS[presetIndex].seconds;

  const playBeep = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    osc.frequency.value = 440;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const selectPreset = useCallback((index: number) => {
    setPresetIndex(index);
    setSecondsLeft(POMODORO_PRESETS[index].seconds);
    setIsRunning(false);
  }, []);

  const toggleRunning = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(POMODORO_PRESETS[presetIndex].seconds);
    setCompletedRounds(0);
    setCurrentRound(1);
  }, [presetIndex]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        playBeep();
        setCompletedRounds((cr) => {
          const nextCompleted = cr + 1;
          if (nextCompleted >= TOTAL_POMODORO_ROUNDS) {
            setIsRunning(false);
            setCurrentRound(TOTAL_POMODORO_ROUNDS);
            return TOTAL_POMODORO_ROUNDS;
          }
          setCurrentRound((r) => r + 1);
          return nextCompleted;
        });
        return POMODORO_PRESETS[presetIndex].seconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, presetIndex, playBeep]);

  const progress = 1 - secondsLeft / totalSeconds;

  return {
    presetIndex,
    presets: POMODORO_PRESETS,
    secondsLeft,
    totalSeconds,
    isRunning,
    completedRounds,
    currentRound,
    totalRounds: TOTAL_POMODORO_ROUNDS,
    progress,
    selectPreset,
    toggleRunning,
    reset,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
