"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatTime, usePomodoro } from "../hooks/usePomodoro";

const RING_SIZE = 120;
const STROKE = 8;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type WellbeingPomodoroPanelProps = {
  onComplete?: (meta: { durationMinutes: number }) => void;
};

export function WellbeingPomodoroPanel({ onComplete }: WellbeingPomodoroPanelProps) {
  const t = useTranslations("studentWellbeing");
  const {
    presetIndex,
    presets,
    secondsLeft,
    isRunning,
    progress,
    focusSeconds,
    phase,
    enabled,
    sessionComplete,
    selectPreset,
    toggleRunning,
    reset,
  } = usePomodoro();
  const completionNotifiedRef = useRef(false);
  const activePreset = presets[presetIndex];
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const statusLabel =
    enabled && phase === "break"
      ? t("focusMode.breakStatus", { duration: activePreset.label })
      : t("focusMode.status", { duration: activePreset.label });

  useEffect(() => {
    if (!sessionComplete || completionNotifiedRef.current) return;
    completionNotifiedRef.current = true;
    onComplete?.({ durationMinutes: Math.max(1, Math.round(focusSeconds / 60)) });
  }, [onComplete, sessionComplete, focusSeconds]);

  useEffect(() => {
    if (!sessionComplete) {
      completionNotifiedRef.current = false;
    }
  }, [sessionComplete]);

  return (
    <div
      className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6"
      role="group"
      aria-label={t("focusMode.ariaLabel")}
    >
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div
          className={`relative ${isRunning ? "wellbeing-pomodoro-ring--active" : ""}`}
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <div
            className="absolute inset-2 rounded-full bg-[var(--app-primary)]/8"
            aria-hidden
          />
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="relative -rotate-90"
            aria-hidden
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--app-border)"
              strokeWidth={STROKE}
              opacity={0.45}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={phase === "break" ? "var(--app-fg-muted)" : "var(--app-primary)"}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="wellbeing-pomodoro-ring-progress transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-[var(--app-fg)]">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </div>
        <p className="text-center text-xs font-medium text-[var(--app-fg-muted)] sm:text-left">
          {statusLabel}
        </p>
        {sessionComplete ? (
          <span className="rounded-full bg-[var(--app-primary)]/12 px-3 py-1 text-xs font-semibold text-[var(--app-primary)]">
            {t("pomodoroSessionComplete")}
          </span>
        ) : null}
      </div>

      <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:flex-1 sm:items-start">
        <div
          className="inline-flex rounded-xl bg-[var(--app-surface-soft)] p-1"
          role="tablist"
          aria-label={t("focusMode.presetsAria")}
        >
          {presets.map((preset, i) => (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={presetIndex === i}
              onClick={() => selectPreset(i)}
              disabled={enabled && phase === "break"}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                presetIndex === i
                  ? "bg-[var(--app-surface)] text-[var(--app-fg)] shadow-sm"
                  : "text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]"
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
            aria-label={isRunning ? t("breathingGuided.pause") : t("dailyAction.ctaPomodoro")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--app-bg)] shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={t("actions.reset")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)]/80 text-[var(--app-fg-muted)] transition hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
