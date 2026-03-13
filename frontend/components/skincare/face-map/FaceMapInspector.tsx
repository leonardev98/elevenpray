"use client";

import { useState, useMemo } from "react";
import type {
  FaceMarkerApi,
  IssueType,
  Severity,
} from "@/app/lib/skincare/face-map/face-map.types";
import {
  ISSUE_TYPES,
  SEVERITIES,
} from "@/app/lib/skincare/face-map/face-map.constants";

const ISSUE_LABELS: Record<string, string> = {
  acne: "Acné",
  blackheads: "Puntos negros",
  redness: "Rojeces",
  pigmentation: "Manchas",
  dryness: "Resequedad",
  irritation: "Irritación",
  scar: "Cicatrices",
  sensitivity: "Sensibilidad",
  "pore-congestion": "Poros",
  custom: "Otro",
};

const SEVERITY_LABELS: Record<string, string> = {
  mild: "Leve",
  moderate: "Moderado",
  severe: "Severo",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

interface FaceMapInspectorProps {
  markers: FaceMarkerApi[];
  faceModelType: "female" | "male";
  selectedMarkerId: string | null;
  onSelectMarker: (id: string | null) => void;
  onEditMarker: (marker: FaceMarkerApi) => void;
  onDeleteMarker: (id: string) => void;
  deletingId: string | null;
}

export function FaceMapInspector({
  markers,
  faceModelType,
  selectedMarkerId,
  onSelectMarker,
  onEditMarker,
  onDeleteMarker,
  deletingId,
}: FaceMapInspectorProps) {
  const [filterType, setFilterType] = useState<IssueType | "">("");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "">("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = markers.filter((m) => m.faceModelType === faceModelType);
    if (filterType) list = list.filter((m) => m.issueType === filterType);
    if (filterSeverity) list = list.filter((m) => m.severity === filterSeverity);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          (m.notes?.toLowerCase().includes(q)) ||
          ISSUE_LABELS[m.issueType]?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [markers, faceModelType, filterType, filterSeverity, search]);

  const selectedMarker = selectedMarkerId
    ? markers.find((m) => m.id === selectedMarkerId)
    : null;

  return (
    <div className="flex h-full min-h-[200px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] lg:min-h-0">
      <div className="border-b border-[var(--app-border)] p-3">
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">Marcadores</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType((e.target.value || "") as IssueType | "")}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)]"
          >
            <option value="">Todos los tipos</option>
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {ISSUE_LABELS[t]}
              </option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity((e.target.value || "") as Severity | "")}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)]"
          >
            <option value="">Todas</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABELS[s]}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="min-w-[100px] rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {selectedMarker ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--app-fg)]">
                  {ISSUE_LABELS[selectedMarker.issueType] ?? selectedMarker.issueType}
                </h3>
                <span className="rounded-full bg-[var(--app-bg)] px-2 py-0.5 text-xs text-[var(--app-fg)]/70">
                  {SEVERITY_LABELS[selectedMarker.severity] ?? selectedMarker.severity}
                </span>
              </div>
              {selectedMarker.notes && (
                <p className="mb-3 text-sm text-[var(--app-fg)]/80">{selectedMarker.notes}</p>
              )}
              <p className="mb-3 text-xs text-[var(--app-fg)]/50">
                {formatDate(selectedMarker.createdAt)}
              </p>
              {selectedMarker.photoUrl && (
                <div className="mb-3">
                  <img
                    src={selectedMarker.photoUrl}
                    alt=""
                    className="max-h-32 w-full rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEditMarker(selectedMarker)}
                  className="rounded-lg border border-[var(--app-navy)]/40 bg-[var(--app-navy)]/10 px-3 py-1.5 text-sm font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/20"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteMarker(selectedMarker.id)}
                  disabled={deletingId === selectedMarker.id}
                  className="rounded-lg border border-[var(--destructive)]/40 px-3 py-1.5 text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 disabled:opacity-50"
                >
                  {deletingId === selectedMarker.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectMarker(null)}
              className="text-xs text-[var(--app-navy)] hover:underline"
            >
              Ver lista
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.length === 0 ? (
              <li className="py-4 text-center text-sm text-[var(--app-fg)]/50">
                No hay marcadores
              </li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onSelectMarker(m.id)}
                    className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-left transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5"
                  >
                    <span className="block text-sm font-medium text-[var(--app-fg)]">
                      {ISSUE_LABELS[m.issueType] ?? m.issueType}
                    </span>
                    <span className="block text-xs text-[var(--app-fg)]/60">
                      {SEVERITY_LABELS[m.severity]} · {formatDate(m.createdAt)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
