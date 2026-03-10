"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  getWorkspaceCheckins,
  createWorkspaceCheckin,
  updateWorkspaceCheckin,
  deleteWorkspaceCheckin,
  type WorkspaceCheckinApi,
  type CheckinData,
} from "../../../../../../lib/workspace-checkins-api";

function formatDate(s: string) {
  return new Date(s + "Z").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function QuickCheckinForm({
  workspaceId,
  onSaved,
}: {
  workspaceId: string;
  onSaved: () => void;
}) {
  const { token } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [skinFeeling, setSkinFeeling] = useState("");
  const [freeNotes, setFreeNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const data: CheckinData = {};
      if (skinFeeling) data.skinFeeling = skinFeeling;
      if (freeNotes) data.freeNotes = freeNotes;
      await createWorkspaceCheckin(token, workspaceId, {
        checkinDate: today,
        data: Object.keys(data).length ? data : null,
      });
      setSkinFeeling("");
      setFreeNotes("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--app-fg)]">Check-in de hoy</h3>
      {error && (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="mb-3">
        <label className="mb-1 block text-xs text-[var(--app-fg)]/70">¿Cómo está tu piel?</label>
        <input
          type="text"
          value={skinFeeling}
          onChange={(e) => setSkinFeeling(e.target.value)}
          placeholder="Ej. Hidratada, algo tirante…"
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        />
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-[var(--app-fg)]/70">Notas</label>
        <textarea
          value={freeNotes}
          onChange={(e) => setFreeNotes(e.target.value)}
          rows={2}
          placeholder="Lo que quieras anotar…"
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-[var(--app-gold)] py-2 text-sm font-medium text-[var(--app-black)] hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

export default function WorkspaceJournalPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [checkins, setCheckins] = useState<WorkspaceCheckinApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadCheckins() {
    if (!token || !workspaceId) return;
    setLoading(true);
    getWorkspaceCheckins(token, workspaceId)
      .then(setCheckins)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCheckins();
  }, [token, workspaceId]);

  async function handleDelete(c: WorkspaceCheckinApi) {
    if (!token || !confirm("¿Eliminar este check-in?")) return;
    try {
      await deleteWorkspaceCheckin(token, workspaceId, c.id);
      loadCheckins();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-[var(--app-fg)]">
        Skin Journal
      </h2>

      <div className="mb-6 max-w-md">
        <QuickCheckinForm workspaceId={workspaceId} onSaved={loadCheckins} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
        Historial
      </h3>
      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : checkins.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--app-border)] py-8 text-center text-sm text-[var(--app-fg)]/60">
          Aún no hay check-ins. Usa el formulario de arriba para el primero.
        </p>
      ) : (
        <ul className="space-y-2">
          {checkins.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--app-fg)]">
                  {formatDate(c.checkinDate)}
                </p>
                {c.data && (
                  <div className="mt-1 text-sm text-[var(--app-fg)]/70">
                    {c.data.skinFeeling && (
                      <p>
                        <span className="text-[var(--app-fg)]/50">Piel: </span>
                        {c.data.skinFeeling}
                      </p>
                    )}
                    {c.data.freeNotes && (
                      <p className="mt-0.5">{c.data.freeNotes}</p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(c)}
                className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm text-[var(--app-gold)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>
    </div>
  );
}
