"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import type { BreathingExercise, BreathingPhaseType } from "../wellbeing-types";
import { useBreathingExercise } from "../hooks/useBreathingExercise";

const PHASE_BORDER: Record<BreathingPhaseType, string> = {
  inhale: "border-teal-400",
  hold: "border-amber-400",
  exhale: "border-blue-400",
};

interface BreathingModalProps {
  exercise: BreathingExercise | null;
  open: boolean;
  onClose: () => void;
}

export function BreathingModal({ exercise, open, onClose }: BreathingModalProps) {
  const {
    phaseLabel,
    phaseType,
    secondsLeft,
    isPaused,
    roundProgress,
    phaseDuration,
    togglePause,
    reset,
  } = useBreathingExercise(exercise, open);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleClose() {
    onClose();
    reset();
  }

  const borderClass = phaseType ? PHASE_BORDER[phaseType] : "border-[var(--app-primary)]";

  return (
    <AnimatePresence>
      {open && exercise && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={exercise.title}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-app-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="mb-6 text-center text-sm font-medium text-[var(--app-fg-secondary)]">
              {exercise.title}
            </p>

            <div className="flex flex-col items-center">
              <p className="mb-2 text-2xl font-semibold text-[var(--app-fg)]">{phaseLabel}</p>
              <p className="mb-6 text-4xl font-mono font-bold tabular-nums text-[var(--app-primary)]">
                {secondsLeft}
              </p>

              <div
                className={`wellbeing-breathe-circle mb-8 flex h-48 w-48 items-center justify-center rounded-full border-4 bg-[var(--app-surface-soft)] ${borderClass}`}
                style={
                  {
                    "--breathe-duration": `${phaseDuration}s`,
                    animationPlayState: isPaused ? "paused" : "running",
                  } as React.CSSProperties
                }
              />

              <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--app-primary)] transition-all duration-1000 ease-linear"
                  style={{ width: `${roundProgress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={togglePause}
                aria-label={isPaused ? "Reanudar" : "Pausar"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--app-bg)] transition-opacity hover:opacity-90"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
