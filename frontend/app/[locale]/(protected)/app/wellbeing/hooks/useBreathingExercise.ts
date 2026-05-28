"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BreathingExercise, BreathingPhaseType } from "../wellbeing-types";

function getCycleDurationSeconds(exercise: BreathingExercise): number {
  return exercise.phases.reduce((sum, p) => sum + p.seconds, 0);
}

export function useBreathingExercise(exercise: BreathingExercise | null, active: boolean) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(1);
  const [elapsedInSession, setElapsedInSession] = useState(0);

  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(0);
  const cycleIndexRef = useRef(1);
  const elapsedRef = useRef(0);

  const currentPhase = exercise?.phases[phaseIndex] ?? null;

  const totalSessionSeconds = useMemo(
    () => (exercise ? exercise.totalMinutes * 60 : 0),
    [exercise],
  );

  const cycleDuration = useMemo(
    () => (exercise ? getCycleDurationSeconds(exercise) : 0),
    [exercise],
  );

  const totalCycles = useMemo(() => {
    if (!exercise || cycleDuration === 0) return 1;
    return Math.max(1, Math.ceil(totalSessionSeconds / cycleDuration));
  }, [exercise, cycleDuration, totalSessionSeconds]);

  const totalSecondsLeft = Math.max(0, totalSessionSeconds - elapsedInSession);

  const reset = useCallback(() => {
    if (!exercise) return;
    phaseIndexRef.current = 0;
    secondsLeftRef.current = exercise.phases[0].seconds;
    cycleIndexRef.current = 1;
    elapsedRef.current = 0;
    setPhaseIndex(0);
    setSecondsLeft(exercise.phases[0].seconds);
    setPhaseProgress(0);
    setCycleIndex(1);
    setElapsedInSession(0);
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

      elapsedRef.current += 1;
      setElapsedInSession(elapsedRef.current);

      if (elapsedRef.current >= totalSessionSeconds) {
        setIsPaused(true);
        return;
      }

      if (nextSeconds > 0) {
        secondsLeftRef.current = nextSeconds;
        setSecondsLeft(nextSeconds);
        setPhaseProgress(((phase.seconds - nextSeconds) / phase.seconds) * 100);
        return;
      }

      const nextPhaseIndex = (phaseIndexRef.current + 1) % exercise.phases.length;
      if (nextPhaseIndex === 0) {
        cycleIndexRef.current += 1;
        setCycleIndex(cycleIndexRef.current);
      }

      const nextPhase = exercise.phases[nextPhaseIndex];
      phaseIndexRef.current = nextPhaseIndex;
      secondsLeftRef.current = nextPhase.seconds;
      setPhaseIndex(nextPhaseIndex);
      setSecondsLeft(nextPhase.seconds);
      setPhaseProgress(0);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, exercise, isPaused, totalSessionSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const isComplete = elapsedInSession >= totalSessionSeconds && totalSessionSeconds > 0;

  return {
    currentPhase,
    phaseType: currentPhase?.type as BreathingPhaseType | undefined,
    phaseLabel: currentPhase?.label ?? "",
    secondsLeft,
    isPaused,
    phaseProgress,
    phaseDuration: currentPhase?.seconds ?? 4,
    cycleIndex,
    totalCycles,
    totalSecondsLeft,
    totalSessionSeconds,
    isComplete,
    togglePause,
    reset,
  };
}
