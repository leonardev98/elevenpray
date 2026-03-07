"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../providers/auth-provider";
import {
  getRoutine,
  updateRoutine,
  type Routine,
  type Block,
  type DayContent,
} from "../../../../lib/routines-api";

const DAY_LABELS: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export default function RoutineEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { token } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    getRoutine(token, id)
      .then(setRoutine)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  function updateDay(dayKey: string, content: DayContent) {
    if (!routine) return;
    setRoutine({
      ...routine,
      days: {
        ...routine.days,
        [dayKey]: content,
      },
    });
  }

  function updateBlock(
    dayKey: string,
    blockIndex: number,
    block: Partial<Block>,
  ) {
    if (!routine?.days[dayKey]) return;
    const blocks = [...routine.days[dayKey].blocks];
    blocks[blockIndex] = { ...blocks[blockIndex], ...block };
    updateDay(dayKey, { blocks });
  }

  async function handleSave() {
    if (!token || !routine) return;
    setSaving(true);
    setError("");
    try {
      await updateRoutine(token, routine.id, {
        weekLabel: routine.weekLabel,
        year: routine.year,
        weekNumber: routine.weekNumber,
        days: routine.days,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !routine) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">
          {loading ? "Cargando…" : "Rutina no encontrada"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/routines"
          className="text-sm text-[var(--app-fg)]/70 hover:text-[var(--app-gold)]"
        >
          ← Volver a rutinas
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[var(--app-gold)] px-4 py-2 text-sm font-medium text-[var(--app-black)] transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
        {routine.weekLabel} ({routine.year})
      </h1>
      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-6 space-y-6">
        {DAY_KEYS.map((dayKey) => {
          const dayContent = routine.days[dayKey] ?? { blocks: [] };
          return (
            <section
              key={dayKey}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--app-gold)]">
                {DAY_LABELS[dayKey]}
              </h2>
              <div className="space-y-2">
                {dayContent.blocks.map((block, i) => (
                  <div key={i} className="flex gap-2">
                    <select
                      value={block.type}
                      onChange={(e) =>
                        updateBlock(dayKey, i, {
                          type: e.target.value as Block["type"],
                        })
                      }
                      className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm text-[var(--app-fg)]"
                    >
                      <option value="text">Texto</option>
                      <option value="heading">Título</option>
                      <option value="list">Lista</option>
                    </select>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) =>
                        updateBlock(dayKey, i, { content: e.target.value })
                      }
                      placeholder={
                        block.type === "heading"
                          ? "Título"
                          : block.type === "list"
                            ? "Elemento de lista"
                            : "Escribe aquí…"
                      }
                      className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
