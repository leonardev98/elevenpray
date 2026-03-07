"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../providers/auth-provider";
import {
  getRoutines,
  createRoutine,
  deleteRoutine,
  type Routine,
  type CreateRoutineDto,
} from "../../../lib/routines-api";

const DAY_KEYS = [
  "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday", "sunday",
];

function emptyDays(): Record<string, { blocks: { type: "text"; content: string }[] }> {
  const days: Record<string, { blocks: { type: "text"; content: string }[] }> = {};
  for (const d of DAY_KEYS) {
    days[d] = { blocks: [{ type: "text", content: "" }] };
  }
  return days;
}

export default function RoutinesPage() {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    getRoutines(token)
      .then(setRoutines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate() {
    if (!token) return;
    setCreating(true);
    setError("");
    try {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      const dto: CreateRoutineDto = {
        weekLabel: "Semana " + weekNumber,
        year: now.getFullYear(),
        weekNumber,
        days: emptyDays(),
      };
      const created = await createRoutine(token, dto);
      setRoutines((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm("Eliminar esta rutina?")) return;
    try {
      await deleteRoutine(token, id);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">Cargando rutinas…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
          Mis rutinas
        </h1>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] transition hover:opacity-90 disabled:opacity-50"
        >
          {creating ? "Creando…" : "Nueva rutina"}
        </button>
      </div>
      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {routines.length === 0 && (
          <li className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-[var(--app-fg)]/50">
            No tienes rutinas. Crea una para empezar.
          </li>
        )}
        {routines.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition hover:border-[var(--app-gold)]/30"
          >
            <Link
              href={"/dashboard/routines/" + r.id}
              className="font-medium text-[var(--app-fg)] hover:text-[var(--app-gold)]"
            >
              {r.weekLabel} ({r.year})
            </Link>
            <div className="flex gap-2">
              <Link
                href={"/dashboard/routines/" + r.id}
                className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
