"use client";

import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import { LEAGUE_TIERS } from "@/data/gamification-config";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

const TIER_LABELS: Record<string, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
  diamante: "Diamante",
};

const TIER_COLORS: Record<string, string> = {
  bronce: "#B45309",
  plata: "#6B7280",
  oro: "var(--xp)",
  diamante: "#7C3AED",
};

export function WeeklyLeagueCard() {
  const { data } = useGamification();
  const liga = data.extras.liga;
  const tierIdx = LEAGUE_TIERS.indexOf(liga.tier);

  return (
    <div className="student-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <Trophy className="h-5 w-5" style={{ color: TIER_COLORS[liga.tier] }} />
            Liga semanal · {TIER_LABELS[liga.tier]}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {liga.carrera} · {liga.universidad} — compites con tu facultad
          </p>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {liga.diasRestantes} días restantes
        </span>
      </div>

      <div className="mt-4 flex gap-1">
        {LEAGUE_TIERS.map((t, i) => (
          <div
            key={t}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= tierIdx ? "opacity-100" : "opacity-25",
            )}
            style={{
              backgroundColor: i <= tierIdx ? TIER_COLORS[t] : "var(--bg-input)",
            }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <LeagueStat label="Tu posición" value={`#${liga.posicion}`} />
        <LeagueStat
          label="XP esta semana"
          value={liga.xpSemana.toLocaleString("es-PE")}
          highlight
        />
        <LeagueStat label="Participantes" value={String(liga.totalParticipantes)} />
        <LeagueStat label="Liga actual" value={TIER_LABELS[liga.tier]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {liga.enZonaAscenso && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--xp)]/15 px-2.5 py-1 text-[var(--xp)]">
            <ArrowUp className="h-3.5 w-3.5" />
            Top 3 suben de liga
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-2.5 py-1 text-[var(--text-muted)]">
          <ArrowDown className="h-3.5 w-3.5" />
          Últimos 5 bajan
        </span>
      </div>
    </div>
  );
}

function LeagueStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
      <p
        className={cn(
          "text-lg font-bold tracking-tight",
          highlight ? "text-[var(--xp)]" : "text-[var(--text-primary)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
