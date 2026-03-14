"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { hoverCard } from "@/lib/animations";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { DayGroup, DayItem, RoutineSlot } from "@/app/lib/routines-api";
import { autoArrangeGroupByDermOrder } from "@/app/lib/routine-builder";
import type { DayKey, ItemSeverityReason } from "@/app/lib/routine-builder";
import { RoutineStep } from "./routine-step";

interface RoutineSlotCardProps {
  dayKey: DayKey;
  group: DayGroup;
  slot: RoutineSlot;
  droppableId: string;
  onUpdateGroup: (next: DayGroup) => void;
  onEditStep?: (itemId: string) => void;
  itemSeverityMap?: Record<string, "warning" | "conflict">;
  itemSeverityReasonsMap?: Record<string, ItemSeverityReason>;
}

export function RoutineSlotCard({ dayKey: _dayKey, group, slot, droppableId, onUpdateGroup, onEditStep, itemSeverityMap = {}, itemSeverityReasonsMap = {} }: RoutineSlotCardProps) {
  const t = useTranslations("routineBuilder");
  const rawItems = group.items ?? [];
  const items = rawItems.filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i);
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
    <motion.div
      className="flex flex-col gap-3 rounded-xl bg-[var(--app-routine-item-bg)] p-3 transition-colors dark:border dark:border-[var(--app-routine-item-border)]/50 dark:rounded-lg"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-sm font-medium text-[var(--app-fg)]">
          <SlotIcon className="size-4 shrink-0 [color:currentColor]" aria-hidden />
          {slot === "am" ? t("morning") : t("night")}
          {group.time ? <span className="text-[var(--app-fg-muted)]">({group.time})</span> : null}
        </h4>
        {!isEmpty ? (
          <button
            type="button"
            onClick={autoArrange}
            className="text-xs text-[var(--app-fg-muted)] transition hover:text-[var(--app-primary)]"
          >
            {t("autoOptimize")}
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        <div
          ref={setNodeRef}
          className={`rounded-lg border border-dashed py-6 text-center border-[var(--app-border)] ${
            isOver ? "border-[var(--app-primary)]/50 bg-[var(--app-primary-soft)]/30" : ""
          }`}
        >
          <p className="text-sm text-[var(--app-fg-muted)]">{t("noStepsYet")}</p>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className={`max-h-[220px] overflow-y-auto rounded-lg ${isOver ? "ring-1 ring-[var(--app-primary)]/40" : ""}`}
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
                  onEdit={() => onEditStep?.(item.id)}
                  dragDisabled={items.length < 2}
                  severity={itemSeverityMap[item.id]}
                  severityReason={itemSeverityReasonsMap[item.id]}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </motion.div>
  );
}
