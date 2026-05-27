"use client";

import { useGamification } from "../gamification-context";

export function DemoControls() {
  const {
    simulateStudyStreakToday,
    simulateLevelUp,
    simulateReferral,
    tryTreasureChest,
  } = useGamification();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3 text-xs text-[var(--app-fg-muted)]">
      <span>Modo demo</span>
      <span className="text-[var(--app-border)]">·</span>
      <button
        type="button"
        onClick={simulateLevelUp}
        className="text-[var(--app-primary)] hover:underline"
      >
        Simular nivel
      </button>
      <span className="text-[var(--app-border)]">·</span>
      <button
        type="button"
        onClick={simulateStudyStreakToday}
        className="text-[var(--app-primary)] hover:underline"
      >
        Simular racha
      </button>
      <span className="text-[var(--app-border)]">·</span>
      <button
        type="button"
        onClick={simulateReferral}
        className="text-[var(--app-primary)] hover:underline"
      >
        +1 referido
      </button>
      <span className="text-[var(--app-border)]">·</span>
      <button
        type="button"
        onClick={tryTreasureChest}
        className="text-[var(--app-primary)] hover:underline"
      >
        Abrir cofre
      </button>
    </div>
  );
}
