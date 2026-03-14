"use client";

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
  Info,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DayItem } from "@/app/lib/routines-api";
import type { RoutineStepType, ItemSeverityReason } from "@/app/lib/routine-builder";
import { Tooltip } from "@/components/ui/tooltip";

interface RoutineStepProps {
  index: number;
  item: DayItem;
  onChange: (next: DayItem) => void;
  onRemove: () => void;
  onEdit?: () => void;
  dragDisabled?: boolean;
  /** Visual feedback from Routine Intelligence: warning (yellow) or conflict (red). */
  severity?: "warning" | "conflict";
  /** Reason for severity (shown in hover tooltip). */
  severityReason?: ItemSeverityReason;
}

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

const HOVER_DELAY_MS = 400;

export function RoutineStep({ index, item, onChange, onRemove, onEdit, dragDisabled = false, severity, severityReason }: RoutineStepProps) {
  const t = useTranslations("routineBuilder");
  const stepType = (item.stepType as RoutineStepType) ?? "treatment";
  const stepTypeLabel = (st: string) => t(`stepTypes.${st}` as Parameters<typeof t>[0]);

  const displayMessage =
    severity && severityReason
      ? severityReason.messageKey
        ? t(severityReason.messageKey as Parameters<typeof t>[0])
        : severityReason.message ?? ""
      : "";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const severityClasses =
    severity === "warning"
      ? "border-yellow-500 bg-yellow-500/10 dark:border-yellow-500/80 dark:bg-yellow-500/10"
      : severity === "conflict"
        ? "border-red-500 bg-red-500/10 dark:border-red-500/80 dark:bg-red-500/10"
        : "border-[var(--app-routine-item-border)] bg-[var(--app-routine-item-bg)]";

  const articleContent = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className={`rounded p-1 text-[var(--app-fg-muted)] transition ${dragDisabled ? "cursor-default" : "touch-none cursor-grab hover:text-[var(--app-fg)] active:cursor-grabbing"}`}
          {...(dragDisabled ? {} : { ...attributes, ...listeners })}
          aria-label={t("dragToReorder")}
          disabled={dragDisabled}
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
          onClick={() => onEdit?.()}
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
    </>
  );

  const articleEl = (
    <article
      ref={setNodeRef}
      style={style}
      className={`relative flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition hover:border-[var(--app-border)]/80 ${severityClasses} ${isDragging ? "opacity-50" : ""}`}
      aria-label={displayMessage || undefined}
    >
      {articleContent}
    </article>
  );

  if (severity && displayMessage) {
    return (
      <Tooltip delay={HOVER_DELAY_MS}>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={articleEl}
            delay={HOVER_DELAY_MS}
          />
          <Tooltip.Portal>
            <Tooltip.Positioner side="top">
              <Tooltip.Popup
                className={
                  severity === "warning"
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/90 dark:border-yellow-500/80"
                    : "border-red-500 bg-red-50 dark:bg-red-950/90 dark:border-red-500/80"
                }
              >
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-[var(--app-fg-muted)]" aria-hidden />
                  <p className="text-[var(--app-fg)]">{displayMessage}</p>
                </div>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip>
    );
  }

  return articleEl;
}
