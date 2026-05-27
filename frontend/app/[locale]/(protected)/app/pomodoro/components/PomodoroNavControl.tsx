"use client";

import { Pause, Play, Timer, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePomodoro } from "../pomodoro-context";
import { formatPomodoroTime } from "../usePomodoroTimer";

interface PomodoroNavControlProps {
  className?: string;
  /** Variante compacta para barras estrechas (solo icono + tiempo). */
  compact?: boolean;
}

export function PomodoroNavControl({ className, compact = false }: PomodoroNavControlProps) {
  const t = useTranslations("pomodoro");
  const {
    enabled,
    phase,
    secondsLeft,
    isRunning,
    activate,
    deactivate,
    toggleRunning,
    allRoundsDone,
  } = usePomodoro();

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={activate}
        title={t("activate")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-elevated)]",
          className,
        )}
        aria-label={t("activate")}
      >
        <Timer className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
        {!compact && <span>{t("activate")}</span>}
      </button>
    );
  }

  const phaseLabel = phase === "focus" ? t("phaseFocus") : t("phaseBreak");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] p-0.5",
        className,
      )}
      role="group"
      aria-label={t("timerGroup")}
    >
      <span
        className={cn(
          "hidden rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline",
          phase === "break"
            ? "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
            : "bg-[var(--accent-subtle)] text-[var(--accent)]",
        )}
      >
        {phaseLabel}
      </span>
      <span className="px-1.5 font-mono text-xs font-semibold tabular-nums text-[var(--text-primary)]">
        {formatPomodoroTime(secondsLeft)}
      </span>
      <button
        type="button"
        onClick={toggleRunning}
        disabled={allRoundsDone}
        className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] disabled:opacity-40"
        aria-label={isRunning ? t("pause") : t("resume")}
      >
        {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={deactivate}
        className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--error)]"
        aria-label={t("deactivate")}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
