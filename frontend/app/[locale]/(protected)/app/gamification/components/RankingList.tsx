"use client";

import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

const MEDAL_COLORS: Record<number, string> = {
  1: "var(--xp)",
  2: "var(--text-muted)",
  3: "var(--course-5-fg)",
};

export function RankingList() {
  const { data } = useGamification();
  const liga = data.extras.liga;

  if (data.ranking.length === 0) {
    return (
      <div className="student-card px-4 py-8 text-center text-sm text-[var(--app-fg-muted)]">
        Aún no hay ranking para tu carrera. Gana XP esta semana para aparecer cuando esté disponible.
      </div>
    );
  }

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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--accent-fg)]"
            style={{ backgroundColor: entry.avatarColor }}
          >
            {entry.nombre.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-[var(--text-primary)]">{entry.nombre}</p>
              {entry.esUsuario && (
                <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  Tú
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {entry.carrera ?? liga.carrera} · {entry.universidad}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-[var(--xp)]">
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
