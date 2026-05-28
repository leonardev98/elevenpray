"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Wind, RotateCcw, Heart, Play, Sparkles } from "lucide-react";
import type { BreathingExercise } from "../wellbeing-types";
import {
  BREATHING_EXERCISES,
  QUICK_PAUSE_EXERCISE,
} from "../wellbeing-mock-data";
import { WellbeingSectionHeading } from "./WellbeingSectionHeading";
import { BreathingModal } from "./BreathingModal";
import { BentoTile } from "./BentoTile";

const EXERCISE_ICONS = {
  "four-seven-eight": Wind,
  box: RotateCcw,
  calm: Heart,
  "quick-pause": Sparkles,
} as const;

export function CalmExercisesTile({ index = 4 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);

  return (
    <BentoTile span={2} mdSpan={2} index={index} className="self-start">
      <WellbeingSectionHeading icon={Wind} title={t("calmExercisesTitle")} />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setActiveExercise(QUICK_PAUSE_EXERCISE)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--app-primary)]/40 bg-[var(--app-primary)]/15 px-4 py-3 text-sm font-semibold text-[var(--app-primary)] transition-all duration-200 hover:border-[var(--app-primary)]/60 hover:bg-[var(--app-primary)]/20 hover:-translate-y-px"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {t("quickPauseCta")}
        </button>

        {BREATHING_EXERCISES.map((exercise) => {
          const Icon = EXERCISE_ICONS[exercise.id];
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setActiveExercise(exercise)}
              className="group flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 text-left transition-all duration-200 hover:border-[var(--app-primary)]/40 hover:-translate-y-px hover:shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary)]/10 transition-colors group-hover:bg-[var(--app-primary)]">
                <Icon
                  className="h-4 w-4 text-[var(--app-primary)] transition-colors group-hover:text-[var(--app-bg)]"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-[var(--app-fg)] group-hover:text-[var(--app-primary)]">
                  {exercise.title}
                </p>
                <p className="text-xs text-[var(--app-fg-muted)]">{exercise.durationLabel}</p>
              </div>
              <Play className="h-4 w-4 shrink-0 text-[var(--app-primary)]" aria-hidden />
            </button>
          );
        })}
      </div>

      <BreathingModal
        exercise={activeExercise}
        open={activeExercise !== null}
        onClose={() => setActiveExercise(null)}
      />
    </BentoTile>
  );
}
