"use client";

import { useState, useEffect } from "react";
import type {
  CreateMarkerDto,
  FaceMarkerApi,
  IssueType,
  Severity,
} from "@/app/lib/skincare/face-map/face-map.types";
import {
  ISSUE_TYPES,
  SEVERITIES,
  NOTES_MAX_LENGTH,
} from "@/app/lib/skincare/face-map/face-map.constants";
import {
  validateCreateMarker,
  hasValidationErrors,
  type MarkerFormErrors,
} from "@/app/lib/skincare/face-map/face-map.validation";

const ISSUE_LABELS: Record<IssueType, string> = {
  acne: "Acné",
  blackheads: "Puntos negros",
  redness: "Rojeces",
  pigmentation: "Manchas",
  dryness: "Resequedad",
  irritation: "Irritación",
  scar: "Cicatrices",
  sensitivity: "Sensibilidad",
  "pore-congestion": "Poros congestionados",
  custom: "Otro",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  mild: "Leve",
  moderate: "Moderado",
  severe: "Severo",
};

export type FaceMapIssueFormMode =
  | {
      type: "create";
      xPercent: number;
      yPercent: number;
      regionLabel?: string | null;
      photoUrl?: string | null;
    }
  | { type: "edit"; marker: FaceMarkerApi };

interface FaceMapIssueFormProps {
  mode: FaceMapIssueFormMode;
  faceModelType: "female" | "male";
  onSubmit: (dto: CreateMarkerDto) => void;
  onUpdate?: (markerId: string, dto: { issueType?: IssueType; severity?: Severity; notes?: string | null; photoUrl?: string | null }) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function FaceMapIssueForm({
  mode,
  faceModelType,
  onSubmit,
  onUpdate,
  onCancel,
  saving = false,
}: FaceMapIssueFormProps) {
  const isCreate = mode.type === "create";
  const [issueType, setIssueType] = useState<IssueType>(
    isCreate ? "acne" : (mode.marker.issueType as IssueType)
  );
  const [severity, setSeverity] = useState<Severity>(
    isCreate ? "mild" : (mode.marker.severity as Severity)
  );
  const [notes, setNotes] = useState(isCreate ? "" : (mode.marker.notes ?? ""));
  const [photoUrl, setPhotoUrl] = useState(
    isCreate ? (mode.photoUrl ?? "") : (mode.marker.photoUrl ?? "")
  );
  const [errors, setErrors] = useState<MarkerFormErrors>({});

  useEffect(() => {
    setErrors({});
  }, [issueType, severity, notes, photoUrl]);

  const createPhotoUrl = isCreate ? (mode as { photoUrl?: string | null }).photoUrl : undefined;
  useEffect(() => {
    if (createPhotoUrl !== undefined) setPhotoUrl(createPhotoUrl ?? "");
  }, [createPhotoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreate) {
      const dto: CreateMarkerDto = {
        issueType,
        severity,
        notes: notes.trim() || null,
        x: mode.xPercent,
        y: mode.yPercent,
        z: 0,
        regionLabel: mode.regionLabel ?? null,
        photoUrl: photoUrl.trim() || null,
        faceModelType,
      };
      const nextErrors = validateCreateMarker({
        issueType,
        severity,
        notes: notes.trim() || null,
        x: mode.xPercent,
        y: mode.yPercent,
        photoUrl: photoUrl.trim() || null,
      });
      if (hasValidationErrors(nextErrors)) {
        setErrors(nextErrors);
        return;
      }
      onSubmit(dto);
    } else {
      if (!onUpdate) return;
      onUpdate(mode.marker.id, {
        issueType,
        severity,
        notes: notes.trim() || null,
        photoUrl: photoUrl.trim() || null,
      });
    }
  };

  const title = isCreate ? "Nuevo marcador" : "Editar marcador";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
          Tipo de problema
        </label>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value as IssueType)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          aria-invalid={!!errors.issueType}
        >
          {ISSUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {ISSUE_LABELS[t]}
            </option>
          ))}
        </select>
        {errors.issueType && (
          <p className="mt-1 text-xs text-[var(--destructive)]">{errors.issueType}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
          Severidad
        </label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          aria-invalid={!!errors.severity}
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABELS[s]}
            </option>
          ))}
        </select>
        {errors.severity && (
          <p className="mt-1 text-xs text-[var(--destructive)]">{errors.severity}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="Ej. zona muy sensible al sol"
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          aria-invalid={!!errors.notes}
        />
        <p className="mt-0.5 text-xs text-[var(--app-fg)]/50">
          {notes.length}/{NOTES_MAX_LENGTH}
        </p>
        {errors.notes && (
          <p className="mt-1 text-xs text-[var(--destructive)]">{errors.notes}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
          URL de foto (opcional)
        </label>
        <input
          type="url"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          aria-invalid={!!errors.photoUrl}
        />
        {errors.photoUrl && (
          <p className="mt-1 text-xs text-[var(--destructive)]">{errors.photoUrl}</p>
        )}
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-[var(--app-navy)] py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
