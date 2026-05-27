"use client";

import { Lock } from "lucide-react";
import type { Insignia } from "@/data/gamification";
import { cn } from "@/lib/utils";
import { GamificationIcon } from "./GamificationIcon";

interface BadgeCardProps {
  insignia: Insignia;
}

export function BadgeCard({ insignia }: BadgeCardProps) {
  const unlocked = insignia.desbloqueada;

  return (
    <div
      className={cn(
        "student-card flex flex-col items-center gap-3 p-4 text-center transition-all duration-150 hover:scale-[1.03]",
        unlocked
          ? "border-[var(--xp)]/30 bg-[var(--bg-elevated)]"
          : "opacity-60",
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            unlocked
              ? insignia.icono === "Crown"
                ? "bg-gradient-to-br from-amber-400/30 to-amber-600/20 ring-2 ring-amber-500/40"
                : insignia.icono === "Sparkles"
                  ? "bg-gradient-to-br from-violet-500/25 to-fuchsia-500/15 ring-2 ring-violet-400/40"
                  : "bg-[color-mix(in_srgb,var(--xp)_15%,transparent)]"
              : "bg-[var(--bg-input)]",
          )}
        >
          <GamificationIcon
            name={insignia.icono}
            className={cn("h-7 w-7", unlocked ? "text-[var(--xp)]" : "text-[var(--text-muted)]")}
          />
        </div>
        {!unlocked && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)] ring-2 ring-[var(--border)]">
            <Lock className="h-2.5 w-2.5 text-[var(--text-muted)]" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            "text-sm font-semibold",
            unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
          )}
        >
          {insignia.nombre}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">{insignia.descripcion}</p>
      </div>

      {unlocked ? (
        <p className="text-[10px] text-[var(--text-muted)]">Obtenida el {insignia.fecha}</p>
      ) : (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>
              {insignia.progreso} / {insignia.total}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[var(--bg-input)]">
            <div
              className="h-full rounded-full bg-[var(--text-muted)]"
              style={{ width: `${(insignia.progreso / insignia.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
