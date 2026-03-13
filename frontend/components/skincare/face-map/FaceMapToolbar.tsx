"use client";

import { FaceMapLegend } from "./FaceMapLegend";

interface FaceMapToolbarProps {
  onAddMarker?: () => void;
  onImportFromPhoto?: () => void;
}

export function FaceMapToolbar({ onAddMarker, onImportFromPhoto }: FaceMapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {onAddMarker && (
          <button
            type="button"
            onClick={onAddMarker}
            className="rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90"
          >
            Agregar grano
          </button>
        )}
        {onImportFromPhoto && (
          <button
            type="button"
            onClick={onImportFromPhoto}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)]"
          >
            Desde foto
          </button>
        )}
      </div>
      <FaceMapLegend />
    </div>
  );
}
