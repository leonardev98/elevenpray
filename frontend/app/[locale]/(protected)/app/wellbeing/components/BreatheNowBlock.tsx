"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BREATHING_EXERCISES } from "../wellbeing-mock-data";
import type { BreathingExercise } from "../wellbeing-types";
import { BreathingModal } from "./BreathingModal";

export function BreatheNowBlock({ index = 2 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);
  const delayStyle = { "--wellbeing-delay": `${index * 80}ms` } as React.CSSProperties;

  return (
    <section className="wellbeing-calm-block text-center" style={delayStyle}>
      <h2 className="text-xl font-medium text-[var(--app-fg)]">{t("breatheNow.title")}</h2>
      <button
        type="button"
        onClick={() => setActiveExercise(BREATHING_EXERCISES[0])}
        className="mt-5 min-h-14 w-full max-w-md rounded-2xl border border-[var(--app-primary)]/30 bg-[var(--app-primary)]/10 px-8 text-lg font-semibold text-[var(--app-primary)] transition-all duration-300 hover:border-[var(--app-primary)]/50 hover:bg-[var(--app-primary)]/15"
      >
        {t("breatheNow.cta")}
      </button>

      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {BREATHING_EXERCISES.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => setActiveExercise(exercise)}
            className="text-xs text-[var(--app-fg-muted)] underline-offset-2 transition-colors hover:text-[var(--app-primary)] hover:underline"
          >
            {exercise.title}
          </button>
        ))}
      </div>

      <BreathingModal
        exercise={activeExercise}
        open={activeExercise !== null}
        onClose={() => setActiveExercise(null)}
        fullscreen
      />
    </section>
  );
}
