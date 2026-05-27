"use client";

import { useState } from "react";
import { Wind, RotateCcw, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BreathingExercise } from "../wellbeing-types";
import { BREATHING_EXERCISES } from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";
import { BreathingModal } from "./BreathingModal";

const EXERCISE_ICONS: Record<string, LucideIcon> = {
  "four-seven-eight": Wind,
  box: RotateCcw,
  calm: Heart,
  "quick-anxiety": Wind,
  "five-four-three-two-one": Wind,
};

interface BreathingSectionProps {
  priority?: boolean;
}

export function BreathingSection({ priority = false }: BreathingSectionProps) {
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

  return (
    <section className={priority ? "ring-2 ring-[var(--app-primary)] rounded-2xl p-4 -m-4" : ""}>
      <div className="mb-4 flex items-center gap-2">
        <Wind className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Respiración Guiada
        </h2>
        {priority && (
          <span className="ml-2 rounded-full bg-[var(--app-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
            Prioridad
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BREATHING_EXERCISES.map((exercise) => {
          const Icon = EXERCISE_ICONS[exercise.id];
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setActiveExercise(exercise)}
              className="group relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface)] p-5 text-left transition-all duration-300 hover:border-[var(--app-primary)]/60 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--app-primary)]/10 transition-all duration-300 group-hover:scale-150" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-primary)]/10 transition-all duration-300 group-hover:bg-[var(--app-primary)] group-hover:shadow-lg">
                <Icon className="h-6 w-6 text-[var(--app-primary)] transition-colors duration-300 group-hover:text-[var(--app-bg)]" aria-hidden />
              </div>
              <div className="relative mt-4">
                <p className="font-semibold text-[var(--app-fg)] transition-colors duration-300 group-hover:text-[var(--app-primary)]">{exercise.title}</p>
                <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{exercise.durationLabel}</p>
              </div>
            </button>
          );
        })}
      </div>

      <BreathingModal
        exercise={activeExercise}
        open={activeExercise !== null}
        onClose={() => setActiveExercise(null)}
      />
    </section>
  );
}
