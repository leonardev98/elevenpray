"use client";

import type { DayContent, DayGroup } from "@/app/lib/routines-api";
import { ensureAMPMGroups } from "@/app/lib/routine-builder";
import type { DayKey } from "@/app/lib/routine-builder";
import { RoutineSlotCard } from "./routine-slot-card";

interface RoutineDayCardProps {
  dayKey: DayKey;
  dayLabel: string;
  day: DayContent;
  intentLabel?: string;
  onUpdateDay: (next: DayContent) => void;
  onOpenAddProduct: (groupId: string, slot: "am" | "pm") => void;
}

function getSlotGroup(dayKey: DayKey, groups: DayGroup[], slot: "am" | "pm"): DayGroup {
  return (
    groups.find((group) => group.slot === slot) ?? {
      id: `${dayKey}-${slot}`,
      title: slot === "am" ? "Morning Routine" : "Night Routine",
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
  onOpenAddProduct,
}: RoutineDayCardProps) {
  const normalizedDay = ensureAMPMGroups({ [dayKey]: day })[dayKey];
  const groups = normalizedDay.groups ?? [];
  const amGroup = getSlotGroup(dayKey, groups, "am");
  const pmGroup = getSlotGroup(dayKey, groups, "pm");

  const updateGroup = (target: DayGroup) => {
    const nextGroups = groups.map((group) => (group.id === target.id ? target : group));
    const safeGroups = nextGroups.some((group) => group.id === target.id) ? nextGroups : [...nextGroups, target];
    onUpdateDay({ groups: safeGroups });
  };

  const dayNameUpper = dayKey.charAt(0).toUpperCase() + dayKey.slice(1).toUpperCase();

  return (
    <article className="min-w-0 flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-none transition-colors hover:border-neutral-300 dark:border-[var(--app-border)] dark:bg-[var(--app-surface)] dark:hover:border-[var(--app-gold)]/30">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/60">{dayNameUpper}</p>
        {intentLabel ? (
          <span className="mt-1.5 inline-flex rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/10 px-2.5 py-1 text-[11px] text-[var(--app-gold)]">
            {intentLabel}
          </span>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col gap-4">
        <RoutineSlotCard
          group={amGroup}
          slot="am"
          onUpdateGroup={updateGroup}
          onOpenAddProduct={() => onOpenAddProduct(amGroup.id, "am")}
        />
        <RoutineSlotCard
          group={pmGroup}
          slot="pm"
          onUpdateGroup={updateGroup}
          onOpenAddProduct={() => onOpenAddProduct(pmGroup.id, "pm")}
        />
      </div>
    </article>
  );
}
