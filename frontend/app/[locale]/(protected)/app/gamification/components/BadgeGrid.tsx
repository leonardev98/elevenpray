"use client";

import { useGamification } from "../gamification-context";
import { BadgeCard } from "./BadgeCard";

export function BadgeGrid() {
  const { data } = useGamification();
  const unlocked = data.insignias.filter((i) => i.desbloqueada).length;
  const locked = data.insignias.length - unlocked;

  return (
    <section>
      <p className="mb-4 text-xs text-[var(--app-fg-muted)]">
        {unlocked} desbloqueadas · {locked} por conseguir
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.insignias.map((insignia) => (
          <BadgeCard key={insignia.id} insignia={insignia} />
        ))}
      </div>
    </section>
  );
}
