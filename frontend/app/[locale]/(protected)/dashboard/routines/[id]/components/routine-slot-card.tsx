"use client";

import { useTranslations } from "next-intl";
import type { DayGroup, DayItem, RoutineSlot } from "@/app/lib/routines-api";
import { autoArrangeGroupByDermOrder } from "@/app/lib/routine-builder";
import { RoutineStep } from "./routine-step";

interface RoutineSlotCardProps {
  group: DayGroup;
  slot: RoutineSlot;
  onUpdateGroup: (next: DayGroup) => void;
  onOpenAddProduct: () => void;
}

export function RoutineSlotCard({ group, slot, onUpdateGroup, onOpenAddProduct }: RoutineSlotCardProps) {
  const t = useTranslations("routineBuilder");
  const items = group.items ?? [];
  const isEmpty = items.length === 0;

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

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100/80 dark:bg-[var(--app-bg)] dark:hover:bg-[var(--app-bg)]/80">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[var(--app-fg)]">
          {slot === "am" ? "☀ " + t("morning") : "🌙 " + t("night")}
          {group.time ? <span className="ml-1.5 text-[var(--app-fg)]/60">({group.time})</span> : null}
        </h4>
        {!isEmpty ? (
          <button
            type="button"
            onClick={autoArrange}
            className="text-xs text-[var(--app-fg)]/60 transition hover:text-[var(--app-gold)]"
          >
            {t("autoOptimize")}
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-neutral-200 py-6 text-center dark:border-[var(--app-border)]">
          <p className="text-sm text-[var(--app-fg)]/60">{t("noStepsYet")}</p>
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="mt-2 rounded-lg border border-[var(--app-gold)]/40 bg-[var(--app-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--app-gold)] transition hover:bg-[var(--app-gold)]/20"
          >
            {t("addYourFirstProduct")}
          </button>
        </div>
      ) : (
        <>
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
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="rounded-lg border border-[var(--app-gold)]/40 bg-[var(--app-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--app-gold)] transition hover:bg-[var(--app-gold)]/20"
          >
            {t("addProduct")}
          </button>
        </>
      )}
    </div>
  );
}
