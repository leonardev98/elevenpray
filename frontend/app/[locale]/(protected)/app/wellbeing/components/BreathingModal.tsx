"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import type { BreathingExercise, BreathingPhaseType } from "../wellbeing-types";
import { useBreathingExercise } from "../hooks/useBreathingExercise";

const PHASE_BORDER: Record<BreathingPhaseType, string> = {
  inhale: "border-[var(--course-1-fg)]",
  hold: "border-[var(--warning)]",
  exhale: "border-[var(--course-3-fg)]",
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

  const borderClass = phaseType ? PHASE_BORDER[phaseType] : "border-[var(--accent)]";

  return (
    <AnimatePresence>
      {open && exercise && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
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
            className="relative w-full max-w-md rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-8 shadow-[var(--shadow-md)]"
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
              <p className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">{phaseLabel}</p>
              <p className="mb-6 text-4xl font-mono font-bold tabular-nums text-[var(--accent)]">
                {secondsLeft}
              </p>

              <div
                className={`wellbeing-breathe-circle mb-8 flex h-48 w-48 items-center justify-center rounded-full border-4 bg-[var(--bg-input)] ${borderClass}`}
                style={
                  {
                    "--breathe-duration": `${phaseDuration}s`,
                    animationPlayState: isPaused ? "paused" : "running",
                  } as React.CSSProperties
                }
              />

              <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000 ease-linear"
                  style={{ width: `${roundProgress}%` }}
                />
              </div>

              <button
                type="button"
                onClick={togglePause}
                aria-label={isPaused ? "Reanudar" : "Pausar"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
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
