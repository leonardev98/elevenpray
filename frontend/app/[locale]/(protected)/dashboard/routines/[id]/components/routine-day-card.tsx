"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { DayContent, DayGroup } from "@/app/lib/routines-api";
import { autoArrangeGroupByDermOrder, ensureAMPMGroups } from "@/app/lib/routine-builder";
import type { DayKey, ItemSeverityReason } from "@/app/lib/routine-builder";
import { RoutineSlotCard } from "./routine-slot-card";

interface RoutineDayCardProps {
  dayKey: DayKey;
  dayLabel: string;
  day: DayContent;
  intentLabel?: string;
  onUpdateDay: (next: DayContent) => void;
  onEditStep?: (slot: "am" | "pm", itemId: string) => void;
  itemSeverityMap?: Record<string, "warning" | "conflict">;
  itemSeverityReasonsMap?: Record<string, ItemSeverityReason>;
}

function getSlotGroup(dayKey: DayKey, groups: DayGroup[], slot: "am" | "pm", morningRoutine: string, nightRoutine: string): DayGroup {
  return (
    groups.find((group) => group.slot === slot) ?? {
      id: `${dayKey}-${slot}`,
      title: slot === "am" ? morningRoutine : nightRoutine,
      slot,
      items: [],
    }
  );
}

export function RoutineDayCard({
  dayKey,
  dayLabel,
  day,
  intentLabel,
  onUpdateDay,
  onEditStep,
  itemSeverityMap = {},
  itemSeverityReasonsMap = {},
}: RoutineDayCardProps) {
  const t = useTranslations("routineBuilder");
  const normalizedDay = ensureAMPMGroups({ [dayKey]: day })[dayKey];
  const groups = normalizedDay.groups ?? [];
  const amGroup = getSlotGroup(dayKey, groups, "am", t("morningRoutine"), t("nightRoutine"));
  const pmGroup = getSlotGroup(dayKey, groups, "pm", t("morningRoutine"), t("nightRoutine"));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateGroup = (target: DayGroup) => {
    const nextGroups = groups.map((group) => (group.id === target.id ? target : group));
    const safeGroups = nextGroups.some((group) => group.id === target.id) ? nextGroups : [...nextGroups, target];
    onUpdateDay({ groups: safeGroups });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const amItems = amGroup.items ?? [];
    const pmItems = pmGroup.items ?? [];
    const activeInAm = amItems.findIndex((i) => i.id === activeId);
    const activeInPm = pmItems.findIndex((i) => i.id === activeId);
    const sourceSlot: "am" | "pm" = activeInAm >= 0 ? "am" : "pm";
    const sourceItems = sourceSlot === "am" ? amItems : pmItems;
    const sourceIndex = sourceSlot === "am" ? activeInAm : activeInPm;
    const draggedItem = sourceItems[sourceIndex];
    if (!draggedItem) return;

    const amDropId = `${dayKey}-am`;
    const pmDropId = `${dayKey}-pm`;
    if (overId === amDropId || overId === pmDropId) {
      const targetSlot: "am" | "pm" = overId === amDropId ? "am" : "pm";
      if (sourceSlot === targetSlot) return;
      const targetGroup = targetSlot === "am" ? amGroup : pmGroup;
      const targetItems = [...(targetGroup.items ?? []), draggedItem];
      const newTargetGroup = autoArrangeGroupByDermOrder({ ...targetGroup, items: targetItems });
      const newSourceItems = sourceItems.filter((_, i) => i !== sourceIndex);
      const newSourceGroup = { ...(sourceSlot === "am" ? amGroup : pmGroup), items: newSourceItems };
      const nextGroups = groups.map((g) => {
        if (g.slot === sourceSlot) return newSourceGroup;
        if (g.slot === targetSlot) return newTargetGroup;
        return g;
      });
      onUpdateDay({ groups: nextGroups });
      return;
    }

    const overInAm = amItems.findIndex((i) => i.id === overId);
    const overInPm = pmItems.findIndex((i) => i.id === overId);
    const targetSlot: "am" | "pm" | null = overInAm >= 0 ? "am" : overInPm >= 0 ? "pm" : null;
    if (targetSlot === null) return;

    if (sourceSlot === targetSlot) {
      const overIndex = targetSlot === "am" ? overInAm : overInPm;
      const newItems = arrayMove(sourceItems, sourceIndex, overIndex);
      const newGroup = { ...(sourceSlot === "am" ? amGroup : pmGroup), items: newItems };
      const nextGroups = groups.map((g) => (g.slot === sourceSlot ? newGroup : g));
      onUpdateDay({ groups: nextGroups });
      return;
    }

    const targetItems = targetSlot === "am" ? [...amItems] : [...pmItems];
    const overIndex = targetSlot === "am" ? overInAm : overInPm;
    targetItems.splice(overIndex, 0, draggedItem);
    const newTargetGroup = autoArrangeGroupByDermOrder({
      ...(targetSlot === "am" ? amGroup : pmGroup),
      items: targetItems,
    });
    const newSourceItems = sourceItems.filter((_, i) => i !== sourceIndex);
    const newSourceGroup = { ...(sourceSlot === "am" ? amGroup : pmGroup), items: newSourceItems };
    const nextGroups = groups.map((g) => {
      if (g.slot === sourceSlot) return newSourceGroup;
      if (g.slot === targetSlot) return newTargetGroup;
      return g;
    });
    onUpdateDay({ groups: nextGroups });
  }

  return (
    <motion.article
      className="flex w-full min-w-0 flex-col rounded-[14px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
      whileHover={{ scale: 1.01, y: -2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg-secondary)]">{dayLabel}</p>
        {intentLabel ? (
          <span className="mt-1.5 inline-flex rounded-full border border-[var(--app-primary)]/40 bg-[var(--app-primary-soft)] px-2.5 py-1 text-[11px] text-[var(--app-primary)]">
            {intentLabel}
          </span>
        ) : null}
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 flex-col gap-4">
          <RoutineSlotCard dayKey={dayKey} group={amGroup} slot="am" onUpdateGroup={updateGroup} droppableId={`${dayKey}-am`} onEditStep={(itemId) => onEditStep?.("am", itemId)} itemSeverityMap={itemSeverityMap} itemSeverityReasonsMap={itemSeverityReasonsMap} />
          <RoutineSlotCard dayKey={dayKey} group={pmGroup} slot="pm" onUpdateGroup={updateGroup} droppableId={`${dayKey}-pm`} onEditStep={(itemId) => onEditStep?.("pm", itemId)} itemSeverityMap={itemSeverityMap} itemSeverityReasonsMap={itemSeverityReasonsMap} />
        </div>
      </DndContext>
    </motion.article>
  );
}
