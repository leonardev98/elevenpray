"use client";

import { useState } from "react";
import { Wind, RotateCcw, Heart } from "lucide-react";
import type { BreathingExercise } from "../wellbeing-types";
import { BREATHING_EXERCISES } from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";
import { BreathingModal } from "./BreathingModal";

const EXERCISE_ICONS = {
  "four-seven-eight": Wind,
  box: RotateCcw,
  calm: Heart,
} as const;

export function BreathingSection() {
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

  return (
    <section>
      <SectionLabel>RESPIRACIÓN GUIADA</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BREATHING_EXERCISES.map((exercise) => {
          const Icon = EXERCISE_ICONS[exercise.id];
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setActiveExercise(exercise)}
              className="student-card flex flex-col items-start gap-3 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-primary)]/40"
            >
              <Icon className="h-6 w-6 text-[var(--app-primary)]" aria-hidden />
              <div>
                <p className="font-semibold text-[var(--app-fg)]">{exercise.title}</p>
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
