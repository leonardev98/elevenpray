"use client";

import { Check } from "lucide-react";
import { DAY_LABELS } from "@/data/gamification";
import { cn } from "@/lib/utils";

interface StreakHistoryGridProps {
  semanas: boolean[][];
  variant: "estudio" | "tareas";
}

export function StreakHistoryGrid({ semanas, variant }: StreakHistoryGridProps) {
  const isEstudio = variant === "estudio";
  const activeColor = isEstudio ? "bg-[#F97316]" : "bg-[var(--app-primary)]";

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-end gap-1 pr-0">
        {DAY_LABELS.map((label) => (
          <span key={label} className="w-6 text-center text-[10px] text-[var(--app-fg-muted)]">
            {label}
          </span>
        ))}
      </div>
      {semanas.map((semana, weekIndex) => {
        const fullWeek = semana.every(Boolean);
        return (
          <div
            key={weekIndex}
            className={cn(
              "flex justify-end gap-1 rounded-lg py-1",
              fullWeek && "bg-[var(--app-primary)]/10",
            )}
          >
            {semana.map((done, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border",
                  done
                    ? cn(activeColor, "border-transparent text-white")
                    : "border-[var(--app-border)] bg-[var(--app-surface-soft)]",
                )}
              >
                {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
