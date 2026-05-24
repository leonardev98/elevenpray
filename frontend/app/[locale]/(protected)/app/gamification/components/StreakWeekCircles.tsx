"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { DAY_LABELS, MOCK_TODAY_INDEX } from "@/data/gamification";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

const SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-8 w-8",
} as const;

const ICON_SIZE_MAP = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
} as const;

interface StreakWeekCirclesProps {
  semana: boolean[];
  variant: "estudio" | "tareas";
  todayIndex?: number;
  size?: keyof typeof SIZE_MAP;
  staggerOnMount?: boolean;
}

export function StreakWeekCircles({
  semana,
  variant,
  todayIndex = MOCK_TODAY_INDEX,
  size = "md",
  staggerOnMount = false,
}: StreakWeekCirclesProps) {
  const { streakJustCompleted, clearStreakAnimation } = useGamification();
  const isEstudio = variant === "estudio";
  const activeColor = isEstudio ? "bg-[#F97316]" : "bg-[var(--app-primary)]";
  const glowClass = isEstudio
    ? "shadow-[0_0_10px_rgba(249,115,22,0.5)]"
    : "shadow-[0_0_10px_color-mix(in_srgb,var(--app-primary)_50%,transparent)]";
  const pulseClass = isEstudio
    ? "animate-streak-today-pulse"
    : "animate-streak-today-pulse-accent";
  const todayBorder = isEstudio ? "border-[#F97316]" : "border-[var(--app-primary)]";

  useEffect(() => {
    if (streakJustCompleted && isEstudio) {
      const t = setTimeout(clearStreakAnimation, 500);
      return () => clearTimeout(t);
    }
  }, [streakJustCompleted, isEstudio, clearStreakAnimation]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-1">
        {DAY_LABELS.map((label) => (
          <span key={label} className="flex-1 text-center text-[10px] text-[var(--app-fg-muted)]">
            {label}
          </span>
        ))}
      </div>
      <div className="flex justify-between gap-1">
        {semana.map((done, index) => {
          const isToday = index === todayIndex;
          const shouldPop = streakJustCompleted && isEstudio && isToday && done;

          return (
            <div
              key={index}
              className={cn(
                "flex flex-1 items-center justify-center",
                staggerOnMount && "animate-gamification-circle-in",
              )}
              style={staggerOnMount ? { animationDelay: `${index * 50}ms` } : undefined}
            >
              <div
                className={cn(
                  SIZE_MAP[size],
                  "flex items-center justify-center rounded-full border-2 transition-all",
                  done
                    ? cn(activeColor, "border-transparent text-white", isToday && glowClass)
                    : "border-[var(--app-border)] bg-[var(--app-surface-soft)]",
                  !done && isToday && cn("border-dashed", todayBorder, pulseClass),
                  shouldPop && "animate-streak-circle-pop",
                )}
              >
                {done && <Check className={ICON_SIZE_MAP[size]} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
