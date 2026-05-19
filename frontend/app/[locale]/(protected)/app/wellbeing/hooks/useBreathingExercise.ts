"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BreathingExercise, BreathingPhaseType } from "../wellbeing-types";

export function useBreathingExercise(exercise: BreathingExercise | null, active: boolean) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [roundProgress, setRoundProgress] = useState(0);

  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(0);

  const currentPhase = exercise?.phases[phaseIndex] ?? null;

  const reset = useCallback(() => {
    if (!exercise) return;
    phaseIndexRef.current = 0;
    secondsLeftRef.current = exercise.phases[0].seconds;
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].seconds);
    setRoundProgress(0);
    setIsPaused(false);
  }, [exercise]);

  useEffect(() => {
    if (active && exercise) {
      reset();
    }
  }, [active, exercise, reset]);

  useEffect(() => {
    if (!active || !exercise || isPaused) return;

    const interval = setInterval(() => {
      const phase = exercise.phases[phaseIndexRef.current];
      const nextSeconds = secondsLeftRef.current - 1;

      if (nextSeconds > 0) {
        secondsLeftRef.current = nextSeconds;
        setSecondsLeft(nextSeconds);
        setRoundProgress(
          ((phase.seconds - nextSeconds) / phase.seconds) * 100
        );
        return;
      }

      const nextPhaseIndex =
        (phaseIndexRef.current + 1) % exercise.phases.length;
      const nextPhase = exercise.phases[nextPhaseIndex];
      phaseIndexRef.current = nextPhaseIndex;
      secondsLeftRef.current = nextPhase.seconds;
      setPhaseIndex(nextPhaseIndex);
      setSecondsLeft(nextPhase.seconds);
      setRoundProgress(0);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, exercise, isPaused]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  return {
    currentPhase,
    phaseType: currentPhase?.type as BreathingPhaseType | undefined,
    phaseLabel: currentPhase?.label ?? "",
    secondsLeft,
    isPaused,
    roundProgress,
    phaseDuration: currentPhase?.seconds ?? 4,
    togglePause,
    reset,
  };
}
