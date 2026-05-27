"use client";

import { AlertCircle, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification } from "../gamification-context";

export function SharedStreakCard() {
  const { data } = useGamification();
  const partners = data.extras.rachaCompartida;
  const pending = partners.filter((p) => !p.estudioHoy);

  return (
    <div className="student-card flex h-full flex-col p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
        <UsersRound className="h-5 w-5 text-[var(--racha)]" />
        Racha compartida
      </h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Hasta 3 compañeros de tu carrera — accountability real
      </p>

      {pending.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--racha)]/10 px-2.5 py-2 text-xs text-[var(--racha)]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {pending.map((p) => p.nombre.split(" ")[0]).join(", ")} aún no estudia hoy
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {partners.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.inicial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {p.nombre}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">{p.racha} días de racha</p>
            </div>
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                p.estudioHoy ? "bg-emerald-500" : "bg-amber-500",
              )}
              title={p.estudioHoy ? "Estudió hoy" : "Pendiente hoy"}
            />
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-[10px] text-[var(--text-muted)]">
        Recibirás aviso si un compañero no registra estudio antes de medianoche
      </p>
    </div>
  );
}
