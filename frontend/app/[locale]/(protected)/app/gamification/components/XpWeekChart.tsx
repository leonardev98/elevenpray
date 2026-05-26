"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { getTotalXpSemana } from "@/data/gamification";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

const DAY_FULL: Record<string, string> = {
  Lun: "Lunes",
  Mar: "Martes",
  Mié: "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
  Sáb: "Sábado",
  Hoy: "Hoy",
};

export function XpWeekChart() {
  const { data } = useGamification();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxXp = Math.max(...data.historialXP.map((d) => d.xp), 1);
  const totalXp = getTotalXpSemana(data.historialXP);

  return (
    <div className="student-card p-5">
      <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
        {data.historialXP.map((day, index) => {
          const heightPx = day.xp === 0 ? 4 : Math.max((day.xp / maxXp) * 80, 8);
          const isMax = day.xp === maxXp && day.xp > 0;
          const isToday = day.dia === "Hoy";

          return (
            <div
              key={day.dia}
              className="relative flex flex-1 flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <div className="absolute bottom-full mb-2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] px-2 py-1 text-[10px] text-[var(--text-primary)] shadow-[var(--shadow-md)]">
                  {DAY_FULL[day.dia] ?? day.dia} — {day.xp} XP
                </div>
              )}
              <div
                className={cn(
                  "w-full max-w-[40px] rounded-t-[var(--radius-sm)] bg-[var(--xp)] transition-all",
                  isToday && "ring-2 ring-[var(--xp)] ring-offset-2 ring-offset-[var(--bg-surface)]",
                )}
                style={{
                  height: heightPx,
                  opacity: isMax ? 1 : day.xp === 0 ? 0.15 : 0.35 + (day.xp / maxXp) * 0.55,
                }}
              />
              <span className="mt-2 text-[10px] text-[var(--text-muted)]">{day.dia}</span>
              <span className="text-[10px] font-medium text-[var(--text-body)]">{day.xp}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t-[0.5px] border-[var(--border)] pt-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          <span className="text-[var(--xp)]">{totalXp} XP</span> esta semana
        </p>
        <p className="flex items-center gap-1 text-xs text-[var(--success)]">
          <TrendingUp className="h-3.5 w-3.5" />+ {data.comparacionSemana.porcentaje}% vs semana pasada
        </p>
      </div>
    </div>
  );
}
