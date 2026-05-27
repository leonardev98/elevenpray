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
      <div className="mb-4 flex items-center gap-2">
        <Play className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Temporizador de Estudio
        </h2>
      </div>
      <div className="student-card relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface)] p-6 shadow-[var(--app-shadow-card)] transition-all duration-300 hover:shadow-lg lg:flex-row lg:items-center">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--app-primary)]/10" />
        {/* Left — timer ring */}
        <div className="relative flex flex-col items-center lg:flex-1">
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
        <div className="relative mt-6 flex flex-1 flex-col gap-4 lg:mt-0">
          <h3 className="text-lg font-semibold text-[var(--app-fg)]">Pomodoro</h3>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(i)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  presetIndex === i
                    ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-bg)] shadow-md"
                    : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]/60 hover:shadow-sm"
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
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary)]/80 text-[var(--app-bg)] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-0.5" />}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reiniciar"
              className="rounded-xl bg-[var(--app-surface)] p-3 text-[var(--app-fg-muted)] shadow-sm transition-all duration-200 hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg-secondary)] hover:shadow-md"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-[var(--app-fg-muted)]">
            Ronda {Math.min(currentRound, totalRounds)} de {totalRounds}
          </p>

          <div className="flex gap-2">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <CheckCircle2
                key={i}
                className={`h-6 w-6 transition-all duration-300 ${
                  i < completedRounds
                    ? "text-[var(--app-primary)] scale-110"
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
