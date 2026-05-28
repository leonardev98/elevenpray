"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, Pause, Play, RotateCcw, Timer, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePomodoro } from "../pomodoro-context";
import { formatPomodoroTime } from "../usePomodoroTimer";

const RING = 56;
const STROKE = 4;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PomodoroNavControlProps {
  className?: string;
  compact?: boolean;
}

function MiniRing({
  progress,
  phase,
  children,
}: {
  progress: number;
  phase: "focus" | "break";
  children: ReactNode;
}) {
  const offset = CIRCUMFERENCE * (1 - progress);
  return (
    <div className="relative shrink-0" style={{ width: RING, height: RING }}>
      <svg width={RING} height={RING} className="-rotate-90" aria-hidden>
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE}
        />
        <circle
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          stroke={phase === "break" ? "var(--success)" : "var(--accent)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function PomodoroNavControl({ className, compact = false }: PomodoroNavControlProps) {
  const t = useTranslations("pomodoro");
  const [open, setOpen] = useState(false);
  const {
    enabled,
    phase,
    secondsLeft,
    isRunning,
    progress,
    presetIndex,
    presets,
    completedFocusSessions,
    totalRounds,
    allRoundsDone,
    activate,
    deactivate,
    toggleRunning,
    selectPreset,
    reset,
  } = usePomodoro();

  const phaseLabel = phase === "focus" ? t("phaseFocus") : t("phaseBreak");

  const triggerLabel = enabled ? formatPomodoroTime(secondsLeft) : compact ? "" : t("activate");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-full border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--bg-elevated)] data-popup-open:bg-[var(--bg-elevated)]",
          enabled && "pr-2",
          className,
        )}
        aria-label={t("timerGroup")}
      >
        {enabled ? (
          <MiniRing progress={progress} phase={phase}>
            <span className="font-mono text-[10px] font-semibold tabular-nums leading-none">
              {formatPomodoroTime(secondsLeft).replace(/^0/, "")}
            </span>
          </MiniRing>
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-subtle)]">
            <Timer className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
          </span>
        )}
        {triggerLabel ? (
          <span className="font-mono text-xs font-semibold tabular-nums">{triggerLabel}</span>
        ) : null}
        {enabled ? (
          <span
            className={cn(
              "hidden rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:inline",
              phase === "break"
                ? "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                : "bg-[var(--accent-subtle)] text-[var(--accent)]",
            )}
          >
            {phaseLabel}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,18rem)] rounded-2xl border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-md)]"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <div className="absolute inset-3 rounded-full bg-[var(--accent-subtle)]" aria-hidden />
            <svg width={120} height={120} className="relative -rotate-90" aria-hidden>
              <circle
                cx={60}
                cy={60}
                r={54}
                fill="none"
                stroke="var(--border)"
                strokeWidth={6}
                opacity={0.4}
              />
              <circle
                cx={60}
                cy={60}
                r={54}
                fill="none"
                stroke={phase === "break" ? "var(--success)" : "var(--accent)"}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - (enabled ? progress : 0))}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
                {formatPomodoroTime(enabled ? secondsLeft : presets[presetIndex].seconds)}
              </span>
              {enabled ? (
                <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  {phaseLabel}
                </span>
              ) : null}
            </div>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)]">
            {enabled
              ? t("roundProgress", { current: completedFocusSessions + (phase === "break" ? 0 : 1), total: totalRounds })
              : t("panelHint")}
          </p>

          <div
            className="inline-flex w-full rounded-xl bg-[var(--bg-input)] p-1"
            role="tablist"
            aria-label={t("presetsLabel")}
          >
            {presets.map((preset, i) => (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={presetIndex === i}
                disabled={enabled && phase === "break"}
                onClick={() => selectPreset(i)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-xs font-medium transition disabled:opacity-50",
                  presetIndex === i
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center justify-center gap-2">
            {!enabled ? (
              <button
                type="button"
                onClick={() => {
                  activate();
                }}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
              >
                <Play className="h-4 w-4 pl-0.5" />
                {t("activate")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleRunning}
                  disabled={allRoundsDone}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] shadow-md transition hover:scale-105 disabled:opacity-40"
                  aria-label={isRunning ? t("pause") : t("resume")}
                >
                  {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                  aria-label={t("reset")}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deactivate();
                    setOpen(false);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--error)] hover:text-[var(--error)]"
                  aria-label={t("deactivate")}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {enabled ? (
            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: totalRounds }).map((_, i) => (
                <CheckCircle2
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < completedFocusSessions
                      ? "text-[var(--accent)]"
                      : "text-[var(--border)]",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
