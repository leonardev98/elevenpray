"use client";

interface FaceMapEmptyStateProps {
  onAddMarker?: () => void;
}

export function FaceMapEmptyState({ onAddMarker }: FaceMapEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-12 text-center">
      <p className="text-sm font-medium text-[var(--app-fg)]">
        El mapa muestra tus marcadores
      </p>
      <p className="mt-1 text-sm text-[var(--app-fg)]/60">
        Añade marcadores con «Agregar grano» o desde una foto. Aquí verás la evolución.
      </p>
      {onAddMarker && (
        <button
          type="button"
          onClick={onAddMarker}
          className="mt-4 rounded-lg bg-[var(--app-navy)] px-4 py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90"
        >
          Agregar grano
        </button>
      )}
    </div>
  );
}
