"use client";

import { useTranslations } from "next-intl";
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
import type { DayKey } from "@/app/lib/routine-builder";
import { RoutineSlotCard } from "./routine-slot-card";

interface RoutineDayCardProps {
  dayKey: DayKey;
  dayLabel: string;
  day: DayContent;
  intentLabel?: string;
  onUpdateDay: (next: DayContent) => void;
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
    const targetSlot: "am" | "pm" = overInAm >= 0 ? "am" : overInPm >= 0 ? "pm" : null;
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
    <article className="flex w-full min-w-0 flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-[var(--app-border)] dark:bg-[var(--app-surface)] dark:hover:border-[var(--app-navy)]/30">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/60">{dayLabel}</p>
        {intentLabel ? (
          <span className="mt-1.5 inline-flex rounded-full border border-[var(--app-navy)]/35 bg-[var(--app-navy)]/10 px-2.5 py-1 text-[11px] text-[var(--app-navy)]">
            {intentLabel}
          </span>
        ) : null}
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 flex-col gap-4">
          <RoutineSlotCard dayKey={dayKey} group={amGroup} slot="am" onUpdateGroup={updateGroup} droppableId={`${dayKey}-am`} />
          <RoutineSlotCard dayKey={dayKey} group={pmGroup} slot="pm" onUpdateGroup={updateGroup} droppableId={`${dayKey}-pm`} />
        </div>
      </DndContext>
    </article>
  );
}
