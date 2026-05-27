"use client";

import { Target } from "lucide-react";
import type { Mission } from "@/data/gamification";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

export function MissionsPanel() {
  const { data, claimMission } = useGamification();
  const diarias = data.extras.misiones.filter((m) => m.tipo === "diaria");
  const semanales = data.extras.misiones.filter((m) => m.tipo === "semanal");

  return (
    <div className="student-card p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <Target className="h-5 w-5 text-[var(--accent)]" />
        Misiones activas
      </h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Alcanzables en ~5 min — XP extra al completar
      </p>

      <MissionGroup title="Hoy" missions={diarias} onClaim={claimMission} />
      <MissionGroup title="Esta semana" missions={semanales} onClaim={claimMission} />
    </div>
  );
}

function MissionGroup({
  title,
  missions,
  onClaim,
}: {
  title: string;
  missions: Mission[];
  onClaim: (id: string) => void;
}) {
  if (missions.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </p>
      <ul className="space-y-3">
        {missions.map((m) => (
          <li
            key={m.id}
            className={cn(
              "rounded-[var(--radius-sm)] border p-3",
              m.reclamada
                ? "border-[var(--border)] opacity-60"
                : "border-[var(--border)] bg-[var(--bg-elevated)]",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{m.titulo}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{m.descripcion}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[var(--xp)]">+{m.xp} XP</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-input)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${(m.progreso / m.total) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                {m.progreso}/{m.total}
              </span>
            </div>
            {m.completada && !m.reclamada && (
              <button
                type="button"
                onClick={() => onClaim(m.id)}
                className="mt-2 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Reclamar recompensa
              </button>
            )}
            {m.reclamada && (
              <p className="mt-2 text-[10px] text-[var(--xp)]">Recompensa reclamada</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
