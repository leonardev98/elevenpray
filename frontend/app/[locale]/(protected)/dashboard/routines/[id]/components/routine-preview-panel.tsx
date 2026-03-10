"use client";

import type { DayContent } from "@/app/lib/routines-api";
import type { DayKey } from "@/app/lib/routine-builder";

interface RoutinePreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  days: Record<string, DayContent>;
  dayNameByKey: (day: DayKey) => string;
}

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function RoutinePreviewPanel({ isOpen, onClose, days, dayNameByKey }: RoutinePreviewPanelProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/40 p-3 md:p-8">
      <div className="mx-auto h-full max-w-5xl overflow-auto rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[var(--app-fg)]">Simplified routine view</h3>
            <p className="text-xs text-[var(--app-fg)]/60">Read your full week at a glance.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-[var(--app-fg)]/55 hover:bg-[var(--app-bg)]">
            Close
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DAY_KEYS.map((day) => (
            <article key={day} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
              <h4 className="text-sm font-semibold text-[var(--app-fg)]">{dayNameByKey(day)}</h4>
              {(days[day]?.groups ?? []).map((group) => (
                <div key={group.id} className="mt-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--app-fg)]/50">
                    {group.slot === "pm" ? "Night" : "Morning"}
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-[var(--app-fg)]/75">
                    {group.items.map((item) => (
                      <li key={item.id}>- {item.content || item.stepType || "Step"}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
