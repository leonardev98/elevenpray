"use client";

import type { DayItem } from "@/app/lib/routines-api";
import type { RoutineStepType } from "@/app/lib/routine-builder";

interface RoutineStepItemProps {
  index: number;
  item: DayItem;
  onChange: (next: DayItem) => void;
  onRemove: () => void;
}

const STEP_TYPES: RoutineStepType[] = [
  "cleanser",
  "toner",
  "serum",
  "treatment",
  "eye",
  "moisturizer",
  "sunscreen",
  "mask",
  "exfoliant",
  "retinoid",
];

export function RoutineStepItem({ index, item, onChange, onRemove }: RoutineStepItemProps) {
  return (
    <article className="rounded-xl border border-[var(--app-routine-item-border)] bg-[var(--app-routine-item-bg)] p-3 transition hover:border-[var(--app-primary)]/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-semibold text-[var(--app-primary)]">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.content}
            onChange={(event) => onChange({ ...item, content: event.target.value })}
            placeholder="Step name"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--app-fg)] outline-none placeholder:text-[var(--app-fg)]/40"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg px-2 py-1 text-xs text-[var(--app-fg-muted)] transition hover:bg-red-500/10 hover:text-red-500"
        >
          Remove
        </button>
      </div>
      <div className="mt-2">
        <select
          value={item.stepType ?? ""}
          onChange={(event) => onChange({ ...item, stepType: event.target.value })}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)]"
        >
          <option value="">Step type</option>
          {STEP_TYPES.map((step) => (
            <option key={step} value={step}>
              {step}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
