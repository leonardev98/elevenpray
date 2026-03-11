"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  getWorkspacePhotos,
  createWorkspacePhoto,
  deleteWorkspacePhoto,
  type WorkspacePhotoApi,
  type PhotoAngle,
  PHOTO_ANGLE_LABELS,
} from "../../../../../../lib/workspace-photos-api";

const ANGLES: PhotoAngle[] = ["front", "left", "right"];

function formatDate(s: string) {
  return new Date(s + "Z").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WorkspacePhotosPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [photos, setPhotos] = useState<WorkspacePhotoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [angle, setAngle] = useState<PhotoAngle>("front");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  function loadPhotos() {
    if (!token || !workspaceId) return;
    setLoading(true);
    getWorkspacePhotos(token, workspaceId)
      .then(setPhotos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPhotos();
  }, [token, workspaceId]);

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !imageUrl.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createWorkspacePhoto(token, workspaceId, {
        photoDate,
        angle,
        notes: notes.trim() || null,
        imageUrl: imageUrl.trim(),
      });
      setModalOpen(false);
      setImageUrl("");
      setNotes("");
      loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: WorkspacePhotoApi) {
    if (!token || !confirm("¿Eliminar esta foto?")) return;
    try {
      await deleteWorkspacePhoto(token, workspaceId, p.id);
      loadPhotos();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  const photosByDate = photos.reduce<Record<string, WorkspacePhotoApi[]>>((acc, p) => {
    const d = p.photoDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(p);
    return acc;
  }, {});
  const sortedDates = Object.keys(photosByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--app-fg)]">
          Progress Photos
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-[var(--app-navy)] px-3 py-1.5 text-sm font-medium text-[var(--app-white)] hover:opacity-90"
        >
          Añadir foto
        </button>
      </div>

      <p className="mb-4 text-sm text-[var(--app-fg)]/60">
        Usa la misma iluminación y ángulo para comparar mejor con el tiempo.
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : sortedDates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-sm text-[var(--app-fg)]/60">
          No hay fotos. Añade la primera para seguir tu progreso.
        </p>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <section key={date}>
              <h3 className="mb-2 text-sm font-semibold text-[var(--app-fg)]/80">
                {formatDate(date)}
              </h3>
              <div className="flex flex-wrap gap-3">
                {photosByDate[date].map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] overflow-hidden max-w-[200px]"
                  >
                    <div className="aspect-square bg-[var(--app-bg)] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={`${formatDate(p.photoDate)} ${PHOTO_ANGLE_LABELS[p.angle]}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-[var(--app-fg)]">
                        {PHOTO_ANGLE_LABELS[p.angle]}
                      </p>
                      {p.notes && (
                        <p className="text-xs text-[var(--app-fg)]/70 truncate" title={p.notes}>
                          {p.notes}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="mt-1 text-xs text-red-600 hover:underline dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm text-[var(--app-navy)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>

      {modalOpen && (
        <>
          <div
            role="presentation"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
              Añadir foto
            </h3>
            <form onSubmit={handleAddPhoto} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--app-fg)]/70">Fecha</label>
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--app-fg)]/70">Ángulo</label>
                <select
                  value={angle}
                  onChange={(e) => setAngle(e.target.value as PhotoAngle)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                >
                  {ANGLES.map((a) => (
                    <option key={a} value={a}>
                      {PHOTO_ANGLE_LABELS[a]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--app-fg)]/70">URL de la imagen *</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://…"
                  required
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--app-fg)]/70">Notas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !imageUrl.trim()}
                  className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Guardando…" : "Añadir"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
