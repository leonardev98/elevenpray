"use client";

import { useTranslations } from "next-intl";
import { Sun, Moon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DayGroup, DayItem, RoutineSlot } from "@/app/lib/routines-api";
import { autoArrangeGroupByDermOrder } from "@/app/lib/routine-builder";
import type { DayKey } from "@/app/lib/routine-builder";
import { RoutineStep } from "./routine-step";

interface RoutineSlotCardProps {
  dayKey: DayKey;
  group: DayGroup;
  slot: RoutineSlot;
  droppableId: string;
  onUpdateGroup: (next: DayGroup) => void;
}

export function RoutineSlotCard({ dayKey: _dayKey, group, slot, droppableId, onUpdateGroup }: RoutineSlotCardProps) {
  const t = useTranslations("routineBuilder");
  const items = group.items ?? [];
  const isEmpty = items.length === 0;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  const updateItem = (itemId: string, updater: (prev: DayItem) => DayItem) => {
    onUpdateGroup({
      ...group,
      items: items.map((item) => (item.id === itemId ? updater(item) : item)),
    });
  };

  const removeItem = (itemId: string) => {
    onUpdateGroup({
      ...group,
      items: items.filter((item) => item.id !== itemId),
    });
  };

  const autoArrange = () => onUpdateGroup(autoArrangeGroupByDermOrder(group));

  const SlotIcon = slot === "am" ? Sun : Moon;
  const itemIds = items.map((i) => i.id);

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100/80 dark:bg-[var(--app-bg)] dark:hover:bg-[var(--app-bg)]/80">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-sm font-medium text-[var(--app-fg)]">
          <SlotIcon className="size-4 shrink-0 [color:currentColor]" aria-hidden />
          {slot === "am" ? t("morning") : t("night")}
          {group.time ? <span className="text-[var(--app-fg)]/60">({group.time})</span> : null}
        </h4>
        {!isEmpty ? (
          <button
            type="button"
            onClick={autoArrange}
            className="text-xs text-[var(--app-fg)]/60 transition hover:text-[var(--app-navy)]"
          >
            {t("autoOptimize")}
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        <div
          ref={setNodeRef}
          className={`rounded-lg border border-dashed py-6 text-center dark:border-[var(--app-border)] ${
            isOver ? "border-[var(--app-navy)]/50 bg-[var(--app-navy)]/5" : "border-neutral-200"
          }`}
        >
          <p className="text-sm text-[var(--app-fg)]/60">{t("noStepsYet")}</p>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className={`max-h-[220px] overflow-y-auto rounded-lg ${isOver ? "ring-1 ring-[var(--app-navy)]/30" : ""}`}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <RoutineStep
                  key={item.id}
                  index={index}
                  item={item}
                  onChange={(next) => updateItem(item.id, () => next)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}
