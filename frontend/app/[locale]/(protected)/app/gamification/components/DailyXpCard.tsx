"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";
import { GamificationIcon } from "./GamificationIcon";

export function DailyXpCard() {
  const { data } = useGamification();
  const [barWidth, setBarWidth] = useState(0);
  const metaDiaria = data.xpMetaDiaria > 0 ? data.xpMetaDiaria : 100;
  const progress = Math.min((data.xpHoy / metaDiaria) * 100, 100);
  const nivel = Number.isFinite(data.user.nivel) ? data.user.nivel : 1;
  const xpActual = Number.isFinite(data.user.xpActual) ? data.user.xpActual : 0;
  const xpSiguienteNivel =
    Number.isFinite(data.user.xpSiguienteNivel) && data.user.xpSiguienteNivel > 0
      ? data.user.xpSiguienteNivel
      : 400;
  const xpFaltante = Math.max(0, xpSiguienteNivel - xpActual);
  const nivelProgress =
    xpSiguienteNivel > 0 ? Math.min(xpActual / xpSiguienteNivel, 1) : 0;

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(progress), 100);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div className="student-card flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:gap-6">
      <div className="min-w-0 flex-1 lg:max-w-[280px]">
        <p className="text-base font-semibold text-[var(--app-fg)]">
          Buenos días, {data.user.nombre}
        </p>
        <p className="mt-1 text-xs text-[var(--app-fg-muted)] capitalize">
          {today} · Día {data.rachas.estudio.actual} de racha de estudio
        </p>
      </div>

      <div className="min-w-0 flex-[2]">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--app-fg-secondary)]">XP de hoy</span>
          <span className="text-xs font-semibold text-[var(--app-fg)]">
            {data.xpHoy} / {metaDiaria} XP
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bg-input)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-[800ms] ease-out"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {data.actividadesHoy.map((act) => (
            <div key={act.id} className="group relative">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border-[0.5px] transition",
                  act.completado
                    ? "border-[var(--success)]/30 bg-[var(--accent-subtle)]"
                    : "border-[var(--border)] bg-[var(--bg-input)]",
                )}
                title={act.label}
              >
                <GamificationIcon
                  name={act.icono}
                  className={cn(
                    "h-4 w-4",
                    act.completado ? "text-[var(--success)]" : "text-[var(--text-muted)]",
                  )}
                />
                {act.completado && (
                  <Check className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--success)] p-0.5 text-[var(--accent-fg)]" />
                )}
              </div>
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] px-2 py-1 text-[10px] text-[var(--text-primary)] opacity-0 shadow-[var(--shadow-md)] transition group-hover:opacity-100">
                +{act.xp} XP
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--bg-input)"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--xp)"
              strokeWidth="4"
              strokeDasharray={`${nivelProgress * 175.9} 175.9`}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[var(--text-muted)]">Nivel</span>
            <span className="text-2xl font-bold text-[var(--xp)]">{nivel}</span>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
          {xpFaltante} XP para nivel {nivel + 1}
        </p>
      </div>
    </div>
  );
}
