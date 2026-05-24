"use client";

import { CheckCircle2, Flame, Star, Zap } from "lucide-react";
import { useGamification } from "../gamification-context";

export function GamificationHero() {
  const { data } = useGamification();
  const { user } = data;
  const xpProgress = (user.xpActual / user.xpSiguienteNivel) * 100;
  const xpFaltante = user.xpSiguienteNivel - user.xpActual;

  return (
    <div className="student-card overflow-hidden bg-gradient-to-br from-[var(--app-surface)] via-[var(--app-surface-elevated)] to-[var(--app-bg)] p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] text-2xl font-bold text-[var(--app-bg)]">
            {user.avatarInicial}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-[var(--app-fg)]">{user.nombre}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary)]/15 px-3 py-1 text-xs font-medium text-[var(--app-primary)]">
              <Star className="h-3.5 w-3.5" />
              {user.titulo}
            </span>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-[var(--app-fg)]">
                Nivel {user.nivel}{" "}
                <span className="font-normal text-[var(--app-fg-muted)]">
                  · {user.xpActual} / {user.xpSiguienteNivel} XP para nivel {user.nivel + 1}
                </span>
              </p>
              <div className="h-1.5 max-w-md overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--app-fg-muted)]">{xpFaltante} XP para subir de nivel</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          <StatItem
            label="Racha estudio"
            value={data.rachas.estudio.actual}
            icon={<Flame className="h-4 w-4 text-[#F97316]" />}
          />
          <StatItem
            label="Racha tareas"
            value={data.rachas.tareas.actual}
            icon={<CheckCircle2 className="h-4 w-4 text-[var(--app-primary)]" />}
          />
          <StatItem
            label="Total XP"
            value={user.xpActual.toLocaleString("es-PE")}
            icon={<Zap className="h-4 w-4 text-amber-400" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[10px] text-[var(--app-fg-muted)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xl font-bold text-[var(--app-fg)]">{value}</span>
        {icon}
      </div>
    </div>
  );
}
