"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";

const DAYS = [
  { key: "mon", short: "Lun", label: "Lunes" },
  { key: "tue", short: "Mar", label: "Martes" },
  { key: "wed", short: "Mié", label: "Miércoles" },
  { key: "thu", short: "Jue", label: "Jueves" },
  { key: "fri", short: "Vie", label: "Viernes" },
  { key: "sat", short: "Sáb", label: "Sábado" },
  { key: "sun", short: "Dom", label: "Domingo" },
] as const;

interface WeekScheduleCardProps {
  workspaceId: string;
}

function hasRoutineContent(days: Record<string, unknown> | undefined): boolean {
  if (!days || typeof days !== "object") return false;
  for (const day of Object.values(days)) {
    const d = day as { groups?: unknown[]; items?: unknown[]; blocks?: unknown[] } | undefined;
    if (d?.groups?.length || d?.items?.length || d?.blocks?.length) return true;
  }
  return false;
}

export function WeekScheduleCard({ workspaceId }: WeekScheduleCardProps) {
  const { token } = useAuth();
  const [hasContent, setHasContent] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getRoutineTemplatesByWorkspace(token, workspaceId)
      .then((templates: unknown[]) => {
        const list = templates as { year: number; weekNumber: number; days?: Record<string, unknown> }[];
        const template = list.find((r) => r.year === 0 && r.weekNumber === 0);
        setHasContent(template ? hasRoutineContent(template.days) : false);
      })
      .catch(() => setHasContent(false));
  }, [token, workspaceId]);

  const showGrid = hasContent === true;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm"
      aria-labelledby="week-schedule-heading"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 id="week-schedule-heading" className="text-xl font-semibold tracking-tight text-[var(--app-fg)]">
          Tu rutina semanal
        </h2>
        <Link
          href={`/dashboard/workspaces/${workspaceId}/routine`}
          className="rounded-xl bg-[var(--app-navy)] px-4 py-2.5 text-sm font-medium text-[var(--app-white)] shadow-sm transition hover:opacity-90"
        >
          Armar rutina
        </Link>
      </div>

      {!showGrid && (
        <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 py-10 text-center">
          <p className="text-[var(--app-fg)]/70">
            Tu rutina está vacía. Organiza mañana y noche por día.
          </p>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/routine`}
            className="mt-4 inline-block rounded-xl bg-[var(--app-gold)]/15 px-5 py-2.5 text-sm font-medium text-[var(--app-gold)] transition hover:bg-[var(--app-gold)]/25"
          >
            Armar rutina
          </Link>
        </div>
      )}

      {showGrid && (
        <>
          <p className="mb-6 text-sm text-[var(--app-fg)]/60">
            Organiza tu semana: mañana y noche. Edita los días y añade los pasos de tu rutina.
          </p>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <Link
                key={day.key}
                href={`/dashboard/workspaces/${workspaceId}/routine`}
                className="flex flex-col items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-5 transition hover:border-[var(--app-gold)]/40 hover:bg-[var(--app-gold)]/5"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/60">
                  {day.short}
                </span>
                <span className="mt-1 text-lg font-semibold text-[var(--app-fg)]">—</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
