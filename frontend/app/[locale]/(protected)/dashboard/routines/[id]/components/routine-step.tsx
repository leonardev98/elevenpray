"use client";

import { useState } from "react";
import {
  Droplet,
  Wine,
  FlaskConical,
  Atom,
  Sparkles,
  Droplets,
  Sun,
  Eye,
  Moon,
  TestTube,
  Pencil,
  Trash2,
} from "lucide-react";
import type { DayItem } from "@/app/lib/routines-api";
import type { RoutineStepType } from "@/app/lib/routine-builder";

interface RoutineStepProps {
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

const STEP_TYPE_ICON: Record<RoutineStepType, React.ComponentType<{ className?: string }>> = {
  cleanser: Droplet,
  toner: Wine,
  serum: FlaskConical,
  treatment: TestTube,
  retinoid: Atom,
  exfoliant: Sparkles,
  moisturizer: Droplets,
  sunscreen: Sun,
  eye: Eye,
  mask: Moon,
};

function stepTypeLabel(stepType: string): string {
  if (stepType === "eye") return "Eye care";
  return stepType.charAt(0).toUpperCase() + stepType.slice(1);
}

export function RoutineStep({ index, item, onChange, onRemove }: RoutineStepProps) {
  const [editing, setEditing] = useState(false);
  const stepType = (item.stepType as RoutineStepType) ?? "treatment";
  const Icon = STEP_TYPE_ICON[stepType] ?? TestTube;

  if (editing) {
    return (
      <article className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-gold)]/15 text-xs font-semibold text-[var(--app-gold)]">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.content}
            onChange={(e) => onChange({ ...item, content: e.target.value })}
            placeholder="Product or step name"
            className="min-w-0 flex-1 rounded border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-[var(--app-fg)]/60 hover:text-[var(--app-gold)]"
          >
            Done
          </button>
        </div>
        <select
          value={item.stepType ?? ""}
          onChange={(e) => onChange({ ...item, stepType: e.target.value })}
          className="w-full rounded border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)]"
        >
          <option value="">Step type</option>
          {STEP_TYPES.map((step) => (
            <option key={step} value={step}>
              {stepTypeLabel(step)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="self-start text-xs text-red-500/80 hover:text-red-500"
        >
          Remove
        </button>
      </article>
    );
  }

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition hover:border-[var(--app-gold)]/30 dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--app-gold)]/15 text-xs font-semibold text-[var(--app-gold)]">
        {index + 1}
      </span>
      <Icon className="h-4 w-4 shrink-0 text-[var(--app-fg)]/60" />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium capitalize text-[var(--app-fg)]/70">
          {stepTypeLabel(stepType)}
        </span>
        <span className="mx-1.5 text-[var(--app-fg)]/40">–</span>
        <span className="truncate text-sm text-[var(--app-fg)]">
          {item.content || "Unnamed step"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded p-1 text-[var(--app-fg)]/40 transition hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          aria-label="Edit step"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-[var(--app-fg)]/40 transition hover:bg-red-500/10 hover:text-red-500"
          aria-label="Remove step"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
