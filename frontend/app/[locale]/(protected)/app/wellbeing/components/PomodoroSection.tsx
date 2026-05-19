"use client";

import { Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { formatTime, usePomodoro } from "../hooks/usePomodoro";
import { SectionLabel } from "./SectionLabel";

const RING_SIZE = 160;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroSection() {
  const {
    presetIndex,
    presets,
    secondsLeft,
    totalSeconds,
    isRunning,
    completedRounds,
    currentRound,
    totalRounds,
    progress,
    selectPreset,
    toggleRunning,
    reset,
  } = usePomodoro();

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <section>
      <SectionLabel>TEMPORIZADOR DE ESTUDIO</SectionLabel>
      <div className="student-card flex flex-col gap-8 p-6 lg:flex-row lg:items-center">
        {/* Left — timer ring */}
        <div className="flex flex-col items-center lg:flex-1">
          <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="-rotate-90"
              aria-hidden
            >
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-semibold tabular-nums text-[var(--app-fg)]">
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--app-fg-muted)]">Sesión de estudio</p>
        </div>

        {/* Right — controls */}
        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-lg font-semibold text-[var(--app-fg)]">Pomodoro</h3>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(i)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-150 ${
                  presetIndex === i
                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                    : "border-[var(--app-border)] text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]/40"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleRunning}
              aria-label={isRunning ? "Pausar" : "Iniciar"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--app-bg)] transition-opacity hover:opacity-90"
            >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reiniciar"
              className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg-secondary)]"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-[var(--app-fg-muted)]">
            Ronda {Math.min(currentRound, totalRounds)} de {totalRounds}
          </p>

          <div className="flex gap-1.5">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <CheckCircle2
                key={i}
                className={`h-5 w-5 ${
                  i < completedRounds
                    ? "text-[var(--app-primary)]"
                    : "text-[var(--app-border)]"
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
