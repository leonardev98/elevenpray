"use client";

import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

const MEDAL_COLORS: Record<number, string> = {
  1: "#F59E0B",
  2: "#9CA3AF",
  3: "#B45309",
};

export function RankingList() {
  const { data } = useGamification();

  return (
    <div className="student-card divide-y divide-[var(--app-border)] overflow-hidden">
      {data.ranking.map((entry) => (
        <div
          key={entry.posicion}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            entry.esUsuario &&
              "border-l-2 border-l-[var(--app-primary)] bg-[var(--app-primary)]/5",
          )}
        >
          <span className="w-6 text-sm font-medium text-[var(--app-fg-muted)]">
            {entry.posicion}
          </span>
          {entry.posicion <= 3 && (
            <Award
              className="h-5 w-5 shrink-0"
              style={{ color: MEDAL_COLORS[entry.posicion] }}
              aria-hidden
            />
          )}
          {entry.posicion > 3 && <span className="w-5" />}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: entry.avatarColor }}
          >
            {entry.nombre.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-[var(--app-fg)]">{entry.nombre}</p>
              {entry.esUsuario && (
                <span className="shrink-0 rounded-full bg-[var(--app-primary)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--app-primary)]">
                  Tú
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--app-fg-muted)]">{entry.universidad}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-[var(--app-fg)]">
            {entry.xp.toLocaleString("es-PE")} XP
          </span>
        </div>
      ))}
      <p className="px-4 py-3 text-center text-xs text-[var(--app-fg-muted)]">
        Ranking se actualiza cada lunes
      </p>
    </div>
  );
}
