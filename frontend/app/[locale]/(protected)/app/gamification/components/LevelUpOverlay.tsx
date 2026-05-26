"use client";

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { useGamification } from "../gamification-context";

export function LevelUpOverlay() {
  const { levelModalOpen, closeLevelModal, data } = useGamification();

  useEffect(() => {
    if (!levelModalOpen) return;
    const t = setTimeout(closeLevelModal, 3000);
    return () => clearTimeout(t);
  }, [levelModalOpen, closeLevelModal]);

  if (!levelModalOpen) return null;

  const newLevel = data.user.nivel;
  const newTitle = data.user.titulo;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal
      aria-labelledby="level-up-title"
      onClick={closeLevelModal}
    >
      <div
        className="student-card max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <Trophy className="mx-auto h-16 w-16 text-[var(--xp)] animate-level-trophy-pulse" />
        <h2 id="level-up-title" className="mt-4 text-2xl font-bold tracking-[-0.01em] text-[var(--text-primary)]">
          ¡Subiste al Nivel <span className="text-[var(--xp)]">{newLevel}</span>!
        </h2>
        <p className="mt-2 font-medium text-[var(--accent)]">{newTitle}</p>
        <button
          type="button"
          onClick={closeLevelModal}
          className="mt-6 w-full rounded-[var(--radius-md)] bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
