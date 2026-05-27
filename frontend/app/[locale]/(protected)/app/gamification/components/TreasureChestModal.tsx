"use client";

import { Gift, X } from "lucide-react";
import { useGamification } from "../gamification-context";

export function TreasureChestModal() {
  const { treasureReward, dismissTreasure } = useGamification();

  if (!treasureReward) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="treasure-title"
    >
      <div className="student-card relative max-w-sm w-full animate-in fade-in zoom-in-95 p-6 text-center">
        <button
          type="button"
          onClick={dismissTreasure}
          className="absolute right-3 top-3 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--xp)]/20">
          <Gift className="h-8 w-8 text-[var(--xp)]" />
        </div>
        <h2 id="treasure-title" className="text-lg font-semibold text-[var(--text-primary)]">
          ¡Cofre del tesoro!
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Recompensa sorpresa por tu sesión de estudio
        </p>
        <p className="mt-4 text-xl font-bold text-[var(--xp)]">{treasureReward.label}</p>
        <button
          type="button"
          onClick={dismissTreasure}
          className="mt-6 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-fg)]"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
