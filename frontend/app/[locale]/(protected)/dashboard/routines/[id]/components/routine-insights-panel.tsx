"use client";

import type { RoutineInsight } from "@/app/lib/routine-builder";

interface RoutineInsightsPanelProps {
  insights: RoutineInsight[];
}

export function RoutineInsightsPanel({ insights }: RoutineInsightsPanelProps) {
  if (!insights.length) {
    return (
      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <h3 className="text-sm font-semibold text-[var(--app-fg)]">Clinical insights</h3>
        <p className="mt-1 text-xs text-[var(--app-fg)]/60">
          Your routine structure looks balanced. Keep consistency and adjust based on tolerance.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--app-fg)]">Clinical insights</h3>
      <ul className="mt-3 space-y-2">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-fg)]/75"
          >
            {insight.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
