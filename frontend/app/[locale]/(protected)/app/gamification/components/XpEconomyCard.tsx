"use client";

import { Zap } from "lucide-react";
import { XP_ECONOMY_RULES } from "@/data/gamification-config";
import { useGamification } from "../gamification-context";

export function XpEconomyCard() {
  const { data } = useGamification();
  const mult = data.extras.multiplicadorActivo;

  return (
    <div className="student-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <Zap className="h-5 w-5 text-[var(--xp)]" />
            Economía de XP
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Cada punto es inversión en el ecosistema Mitsyy — marketplace futuro
          </p>
        </div>
        {data.extras.rachaSemanalActiva && (
          <span className="rounded-full bg-[var(--xp)]/15 px-3 py-1 text-xs font-semibold text-[var(--xp)]">
            ×1.5 XP esta semana
          </span>
        )}
        {mult.activo && mult.hasta && (
          <span className="rounded-full bg-[var(--racha)]/15 px-3 py-1 text-xs font-semibold text-[var(--racha)]">
            Boost ×{mult.factor} activo
          </span>
        )}
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {XP_ECONOMY_RULES.map((rule) => (
          <li
            key={rule.id}
            className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{rule.accion}</p>
              {"nota" in rule && rule.nota && (
                <p className="text-[10px] text-[var(--text-muted)]">{rule.nota}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-[var(--xp)]">{rule.xp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
