"use client";

import { Shield } from "lucide-react";
import { CYCLE_SHIELDS_PER_CYCLE } from "@/data/gamification-config";
import { useGamification } from "../gamification-context";

export function CycleShieldCard() {
  const { data, useShield } = useGamification();
  const { escudos } = data.extras;

  return (
    <div className="student-card flex h-full flex-col p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Shield className="h-5 w-5 text-[var(--accent)]" />
        Escudo de ciclo
      </h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {CYCLE_SHIELDS_PER_CYCLE} escudos por ciclo — protégete sin romper tu racha
      </p>

      <p className="mt-4 text-xs text-[var(--text-muted)]">{escudos.cicloLabel}</p>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: escudos.maxPorCiclo }).map((_, i) => {
          const used = i < escudos.usadosEsteCiclo;
          const available = i < escudos.usadosEsteCiclo + escudos.disponibles && !used;
          return (
            <div
              key={i}
              className={`flex h-12 flex-1 items-center justify-center rounded-lg border ${
                used
                  ? "border-[var(--border)] bg-[var(--bg-input)] opacity-40"
                  : available
                    ? "border-[var(--accent)]/50 bg-[var(--accent-subtle)]"
                    : "border-dashed border-[var(--border)] bg-transparent"
              }`}
            >
              <Shield
                className={`h-6 w-6 ${
                  available ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                }`}
              />
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-[var(--text-primary)]">
        <span className="font-semibold text-[var(--accent)]">{escudos.disponibles}</span>{" "}
        escudos disponibles · {escudos.usadosEsteCiclo} usados
      </p>

      <button
        type="button"
        disabled={escudos.disponibles <= 0}
        onClick={() => useShield()}
        className="mt-auto pt-4 text-sm font-medium text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 hover:underline"
      >
        Usar escudo hoy
      </button>
    </div>
  );
}
