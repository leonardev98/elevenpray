"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Pause, RotateCcw, CheckCircle2, Sparkles, Smile } from "lucide-react";
import { formatTime, usePomodoro } from "../hooks/usePomodoro";
import { QUICK_PAUSE_EXERCISE } from "../wellbeing-mock-data";
import { WellbeingSectionHeading } from "./WellbeingSectionHeading";
import { BreathingModal } from "./BreathingModal";
import { BentoTile } from "./BentoTile";

const RING_SIZE = 88;
const STROKE = 5;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTile({ index = 5 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const [breathingOpen, setBreathingOpen] = useState(false);
  const {
    presetIndex,
    presets,
    secondsLeft,
    isRunning,
    completedRounds,
    totalRounds,
    progress,
    sessionComplete,
    selectPreset,
    toggleRunning,
    reset,
  } = usePomodoro();

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  function scrollToCheckIn() {
    document.getElementById("register-check-in")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <BentoTile span={2} mdSpan={2} index={index} className="self-start">
      <WellbeingSectionHeading icon={Play} title={t("pomodoroTitle")} />
      <div className="flex flex-col items-center gap-1">
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--app-border)"
              strokeWidth={STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--app-primary)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-lg font-semibold tabular-nums text-[var(--app-fg)]">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {presets.map((preset, i) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(i)}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium transition-all ${
                presetIndex === i
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-bg)]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-secondary)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRunning}
            aria-label={isRunning ? t("breathingGuided.pause") : t("breathingGuided.resume")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--app-bg)] shadow-md transition-transform hover:scale-105"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reiniciar"
            className="rounded-lg bg-[var(--app-surface)] p-1.5 text-[var(--app-fg-muted)] hover:text-[var(--app-fg-secondary)]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <CheckCircle2
              key={i}
              className={`h-3.5 w-3.5 ${
                i < completedRounds ? "text-[var(--app-primary)]" : "text-[var(--app-border)]"
              }`}
              aria-hidden
            />
          ))}
        </div>

        {sessionComplete ? (
          <div className="mt-2 w-full space-y-2 rounded-xl border border-[var(--app-primary)]/20 bg-[var(--app-primary)]/5 p-2.5">
            <p className="text-center text-xs font-medium text-[var(--app-fg-secondary)]">
              {t("pomodoroSessionComplete")}
            </p>
            <div className="flex flex-col gap-1.5 sm:flex-row">
              <button
                type="button"
                onClick={() => setBreathingOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--app-primary)]/30 bg-[var(--app-surface)] px-2 py-2 text-xs font-medium text-[var(--app-primary)] transition-colors hover:bg-[var(--app-primary)]/10"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t("pomodoroEndedSuggestRest")}
              </button>
              <button
                type="button"
                onClick={scrollToCheckIn}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-2 text-xs font-medium text-[var(--app-fg-secondary)] transition-colors hover:border-[var(--app-primary)]/40"
              >
                <Smile className="h-3.5 w-3.5" aria-hidden />
                {t("pomodoroEndedSuggestCheckIn")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <BreathingModal
        exercise={QUICK_PAUSE_EXERCISE}
        open={breathingOpen}
        onClose={() => setBreathingOpen(false)}
      />
    </BentoTile>
  );
}

/** @deprecated Use PomodoroTile */
export const PomodoroSection = PomodoroTile;
