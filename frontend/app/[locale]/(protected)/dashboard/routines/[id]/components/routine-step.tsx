"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

export function RoutineStep({ index, item, onChange, onRemove }: RoutineStepProps) {
  const t = useTranslations("routineBuilder");
  const [editing, setEditing] = useState(false);
  const stepType = (item.stepType as RoutineStepType) ?? "treatment";
  const stepTypeLabel = (st: string) => t(`stepTypes.${st}` as Parameters<typeof t>[0]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (editing) {
    return (
      <article className="flex flex-col gap-2 rounded-xl border border-[var(--app-routine-item-border)] bg-[var(--app-routine-item-bg)] p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-semibold text-[var(--app-primary)]">
            {index + 1}
          </span>
          <input
            type="text"
            value={item.content}
            onChange={(e) => onChange({ ...item, content: e.target.value })}
            placeholder={t("productOrStepName")}
            className="min-w-0 flex-1 rounded border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-[var(--app-fg-muted)] hover:text-[var(--app-primary)]"
          >
            {t("done")}
          </button>
        </div>
        <select
          value={item.stepType ?? ""}
          onChange={(e) => onChange({ ...item, stepType: e.target.value })}
          className="w-full rounded border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-xs text-[var(--app-fg)]"
        >
          <option value="">{t("stepType")}</option>
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
          {t("remove")}
        </button>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[var(--app-routine-item-border)] bg-[var(--app-routine-item-bg)] p-3 transition shadow-sm hover:shadow-md ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="touch-none cursor-grab rounded p-1 text-[var(--app-fg-muted)] transition hover:text-[var(--app-fg)] active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={t("dragToReorder")}
        >
          <GripVertical className="h-4 w-4 shrink-0 [color:currentColor]" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--app-fg)]">
            {item.content || t("unnamedStep")}
          </p>
          <p className="text-xs text-[var(--app-fg-muted)]">
            {stepTypeLabel(stepType)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded p-1 text-[var(--app-fg-muted)] transition hover:bg-[var(--app-surface-elevated)] hover:text-[var(--app-fg)]"
          aria-label={t("editStep")}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-[var(--app-fg-muted)] transition hover:bg-red-500/10 hover:text-red-500"
          aria-label={t("removeStep")}
        >
          <Trash2 className="h-4 w-4 [color:currentColor]" />
        </button>
      </div>
    </article>
  );
}
