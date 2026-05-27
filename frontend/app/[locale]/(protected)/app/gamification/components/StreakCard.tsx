"use client";

import { AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { getTodayWeekIndex } from "@/data/gamification";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";
import { StreakWeekCircles } from "./StreakWeekCircles";

interface StreakCardProps {
  variant: "estudio" | "tareas";
  compact?: boolean;
  showHistory?: boolean;
  staggerOnMount?: boolean;
}

export function StreakCard({
  variant,
  compact = false,
  staggerOnMount = false,
}: StreakCardProps) {
  const { data, streakJustCompleted } = useGamification();
  const racha = data.rachas[variant];
  const isEstudio = variant === "estudio";

  const alertMessage = isEstudio
    ? "¡Estudia hoy para no romper tu racha!"
    : "¡Completa una tarea para mantener tu racha!";

  if (compact) {
    return (
      <div className="student-card space-y-3 p-4">
        <div className="flex items-center gap-2">
          {isEstudio ? (
            <Flame
              className={cn("h-5 w-5", racha.hoy ? "text-[var(--racha)]" : "text-[var(--text-muted)]")}
            />
          ) : (
            <CheckCircle2
              className={cn(
                "h-5 w-5",
                racha.hoy ? "text-[var(--accent)]" : "text-[var(--text-muted)]",
              )}
            />
          )}
          <span
            className={cn(
              "text-2xl font-semibold text-[var(--racha)]",
              streakJustCompleted && isEstudio && "animate-streak-count-pop",
            )}
          >
            {racha.actual}
          </span>
          <span className="text-xs text-[var(--text-muted)]">días seguidos</span>
        </div>
        <StreakWeekCircles semana={racha.semana} variant={variant} size="sm" />
        {!racha.hoy && (
          <p className="text-xs text-[var(--text-body)]">
            ¡Completa una tarea hoy para llegar a {racha.actual + 1}!
          </p>
        )}
        <div>
          <p className="text-xs font-medium text-[var(--text-primary)]">
            <span className="text-[var(--xp)]">{data.xpTareasSemana} XP</span> esta semana
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-input)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${Math.min((data.xpTareasSemana / 500) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        {isEstudio ? (
          <Flame className="h-5 w-5 text-[var(--racha)]" aria-hidden />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" aria-hidden />
        )}
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {isEstudio ? "Racha de Estudio" : "Racha de Tareas"}
        </h3>
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-5xl font-bold tracking-[-0.02em] text-[var(--racha)]",
            streakJustCompleted && isEstudio && "animate-streak-count-pop",
          )}
        >
          {racha.actual}
        </span>
        <span className="text-sm text-[var(--text-muted)]">días</span>
      </div>

      <StreakWeekCircles
        semana={racha.semana}
        variant={variant}
        todayIndex={getTodayWeekIndex()}
        staggerOnMount={staggerOnMount}
      />

      <p className="text-xs text-[var(--text-muted)]">Mejor racha: {racha.mejor} días</p>

      {!racha.hoy && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-xs",
            isEstudio
              ? "bg-[color-mix(in_srgb,var(--racha)_12%,transparent)] text-[var(--racha)]"
              : "bg-[var(--accent-subtle)] text-[var(--accent)]",
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}
    </div>
  );
}
