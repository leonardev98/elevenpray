"use client";

import { AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { MOCK_TODAY_INDEX } from "@/data/gamification";
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
              className={cn("h-5 w-5", racha.hoy ? "text-[#F97316]" : "text-[var(--app-fg-muted)]")}
            />
          ) : (
            <CheckCircle2
              className={cn(
                "h-5 w-5",
                racha.hoy ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)]",
              )}
            />
          )}
          <span
            className={cn(
              "text-2xl font-semibold text-[var(--app-fg)]",
              streakJustCompleted && isEstudio && "animate-streak-count-pop",
            )}
          >
            {racha.actual}
          </span>
          <span className="text-xs text-[var(--app-fg-muted)]">días seguidos</span>
        </div>
        <StreakWeekCircles semana={racha.semana} variant={variant} size="sm" />
        {!racha.hoy && (
          <p className="text-xs text-[var(--app-fg-secondary)]">
            ¡Completa una tarea hoy para llegar a {racha.actual + 1}!
          </p>
        )}
        <div>
          <p className="text-xs font-medium text-[var(--app-fg)]">
            {data.xpTareasSemana} XP esta semana
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
            <div
              className="h-full rounded-full bg-[var(--app-primary)] transition-all"
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
          <Flame className="h-5 w-5 text-[#F97316]" aria-hidden />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
        )}
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">
          {isEstudio ? "Racha de Estudio" : "Racha de Tareas"}
        </h3>
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-5xl font-bold text-[var(--app-fg)]",
            streakJustCompleted && isEstudio && "animate-streak-count-pop",
          )}
        >
          {racha.actual}
        </span>
        <span className="text-sm text-[var(--app-fg-muted)]">días</span>
      </div>

      <StreakWeekCircles
        semana={racha.semana}
        variant={variant}
        todayIndex={MOCK_TODAY_INDEX}
        staggerOnMount={staggerOnMount}
      />

      <p className="text-xs text-[var(--app-fg-muted)]">Mejor racha: {racha.mejor} días</p>

      {!racha.hoy && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
            isEstudio
              ? "bg-orange-500/10 text-orange-300"
              : "bg-[var(--app-primary)]/10 text-[var(--app-primary)]",
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}
    </div>
  );
}
