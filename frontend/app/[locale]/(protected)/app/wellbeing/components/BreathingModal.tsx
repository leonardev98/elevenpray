"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Play, Pause } from "lucide-react";
import type { BreathingExercise, BreathingPhaseType } from "../wellbeing-types";
import { useBreathingExercise } from "../hooks/useBreathingExercise";

const PHASE_BORDER: Record<BreathingPhaseType, string> = {
  inhale: "border-[var(--course-1-fg)]",
  hold: "border-[var(--warning)]",
  exhale: "border-[var(--course-3-fg)]",
};

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getCircleScale(phaseType: BreathingPhaseType | undefined, progress: number): number {
  if (!phaseType) return 0.85;
  if (phaseType === "inhale") return 0.6 + progress * 0.5;
  if (phaseType === "exhale") return 1.1 - progress * 0.5;
  return 1.05;
}

interface BreathingModalProps {
  exercise: BreathingExercise | null;
  open: boolean;
  onClose: () => void;
  fullscreen?: boolean;
  onComplete?: (meta: { exerciseId: string; durationMinutes: number }) => void;
}

export function BreathingModal({
  exercise,
  open,
  onClose,
  fullscreen = false,
  onComplete,
}: BreathingModalProps) {
  const t = useTranslations("studentWellbeing");
  const {
    phaseType,
    phaseLabel,
    secondsLeft,
    isPaused,
    phaseProgress,
    phaseDuration,
    cycleIndex,
    totalCycles,
    totalSecondsLeft,
    isComplete,
    togglePause,
    reset,
  } = useBreathingExercise(exercise, open);
  const completionNotifiedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      completionNotifiedRef.current = false;
      return;
    }
    if (!exercise) return;
    if (isComplete && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.({ exerciseId: exercise.id, durationMinutes: exercise.totalMinutes });
    }
  }, [open, exercise, isComplete, onComplete]);

  function handleClose() {
    onClose();
    reset();
  }

  const borderClass = phaseType ? PHASE_BORDER[phaseType] : "border-[var(--accent)]";
  const progress = phaseProgress / 100;
  const circleScale = getCircleScale(phaseType, progress);

  const phaseTextKey = useMemo(() => {
    if (phaseType === "inhale") return "breathingGuided.inhale";
    if (phaseType === "exhale") return "breathingGuided.exhale";
    return "breathingGuided.hold";
  }, [phaseType]);

  const phaseDisplay = phaseType
    ? `${t(phaseTextKey)}... ${secondsLeft}`
    : "";

  const circleSize = fullscreen ? "h-56 w-56 sm:h-64 sm:w-64" : "h-48 w-48";
  const overlayClass = fullscreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)]/97 p-6 backdrop-blur-md"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4";

  const panelClass = fullscreen
    ? "relative flex w-full max-w-lg flex-col items-center px-4 py-8"
    : "relative w-full max-w-md rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)] sm:p-8";

  return (
    <AnimatePresence>
      {open && exercise && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={overlayClass}
          role="dialog"
          aria-modal="true"
          aria-label={exercise.title}
          onClick={fullscreen ? undefined : handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={panelClass}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label={t("breathingGuided.close")}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
            >
              <X className="h-5 w-5" />
            </button>

            {!fullscreen ? (
              <p className="mb-4 text-center text-sm font-medium text-[var(--app-fg-secondary)]">
                {exercise.title}
              </p>
            ) : null}

            <div className="flex w-full flex-col items-center">
              <p
                className={`mb-1 text-center font-semibold text-[var(--text-primary)] ${
                  fullscreen ? "text-3xl sm:text-4xl" : "text-2xl"
                }`}
              >
                {isComplete ? t("breathingGuided.complete") : phaseDisplay}
              </p>

              <div className="mb-2 flex w-full justify-center gap-4 text-xs text-[var(--app-fg-muted)]">
                <span>
                  {t("breathingGuided.cycle", {
                    current: Math.min(cycleIndex, totalCycles),
                    total: totalCycles,
                  })}
                </span>
                <span>
                  {t("breathingGuided.totalLeft", { time: formatMmSs(totalSecondsLeft) })}
                </span>
              </div>

              <div className={`relative mb-6 flex items-center justify-center ${circleSize}`}>
                <div
                  className={`wellbeing-guided-breathe-circle absolute inset-2 rounded-full border-4 bg-[var(--app-primary)]/5 ${borderClass}`}
                  style={
                    {
                      transform: `scale(${circleScale})`,
                      transitionDuration: isPaused ? "0ms" : `${phaseDuration * 1000}ms`,
                    } as React.CSSProperties
                  }
                  aria-hidden
                />
              </div>

              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300 ease-linear"
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>

              <div className="flex items-center gap-3">
                {!isComplete ? (
                  <button
                    type="button"
                    onClick={togglePause}
                    aria-label={isPaused ? t("breathingGuided.resume") : t("breathingGuided.pause")}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium text-[var(--app-fg)] transition-colors hover:border-[var(--app-primary)]/40"
                >
                  {t("breathingGuided.finish")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
