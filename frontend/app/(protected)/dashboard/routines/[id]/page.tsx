"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "../../../../providers/auth-provider";
import {
  getRoutineTemplate,
  updateRoutineTemplate,
  type Routine,
  type DayContent,
  type UpdateRoutineDto,
} from "../../../../lib/routine-templates-api";
import type { DayItem, DayGroup } from "../../../../lib/routines-api";
import { TimePicker } from "../../components/time-picker";

const DAY_LABELS_SHORT: Record<string, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

const DAY_LABELS: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

function getTodayDayKey(): string {
  const d = new Date().getDay();
  return DAY_KEYS[d === 0 ? 6 : d - 1];
}

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function normalizeDayToGroups(day: DayContent | undefined): DayGroup[] {
  if (!day) return [];
  if (day.groups?.length) return day.groups;
  const items = day.items?.length
    ? day.items
    : (day.blocks ?? []).map((b, i) => ({
        id: (b as { id?: string }).id ?? `legacy-${i}`,
        type: (b as { type: string }).type as DayItem["type"],
        content: (b as { content: string }).content,
      }));
  if (items.length === 0) return [];
  return [
    { id: crypto.randomUUID(), title: "", time: undefined, items },
  ];
}

function SortableDayItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: DayItem;
  onUpdate: (updates: Partial<DayItem>) => void;
  onRemove: () => void;
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] py-1.5 pl-1.5 pr-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1.5 text-[var(--app-fg)]/50 hover:bg-[var(--app-gold)]/10 hover:text-[var(--app-gold)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Mover ítem"
      >
        ⋮⋮
      </button>
      <select
        value={item.type}
        onChange={(e) => onUpdate({ type: e.target.value as DayItem["type"] })}
        className="w-24 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-xs text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
      >
        <option value="text">Texto</option>
        <option value="heading">Título</option>
        <option value="list">Lista</option>
      </select>
      <input
        type="text"
        value={item.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={
          item.type === "heading" ? "Título" : item.type === "list" ? "Elemento" : "Escribe aquí…"
        }
        className="min-w-0 flex-1 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Eliminar"
        className="rounded p-1.5 text-[var(--app-fg)]/40 hover:bg-red-500/10 hover:text-red-500"
      >
        ×
      </button>
    </div>
  );
}

function SortableDayGroup({
  dayKey,
  group,
  onUpdateGroup,
  onRemoveGroup,
  onUpdateItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: {
  dayKey: string;
  group: DayGroup;
  onUpdateGroup: (updates: Partial<Pick<DayGroup, "title" | "time">>) => void;
  onRemoveGroup: () => void;
  onUpdateItems: (items: DayItem[]) => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, updates: Partial<DayItem>) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm ${isDragging ? "opacity-50" : ""} overflow-hidden`}
    >
      {/* Cabecera del grupo: borde izquierdo de acento */}
      <div className="flex border-l-4 border-[var(--app-gold)] bg-[var(--app-gold)]/5">
        <div className="flex flex-1 flex-wrap items-center gap-2 p-3">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1.5 text-[var(--app-fg)]/50 hover:bg-[var(--app-gold)]/20 hover:text-[var(--app-gold)] active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Mover contenedor"
          >
            ⋮⋮
          </button>
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/50">
            Bloque
          </span>
          <input
            type="text"
            value={group.title}
            onChange={(e) => onUpdateGroup({ title: e.target.value })}
            placeholder="Título"
            className="min-w-0 flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 text-sm font-medium text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          />
          <TimePicker
            value={group.time}
            onChange={(v) => onUpdateGroup({ time: v })}
            className="shrink-0"
          />
          <button
            type="button"
            onClick={onRemoveGroup}
            aria-label="Eliminar contenedor"
            className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--app-fg)]/50 hover:bg-red-500/10 hover:text-red-500"
          >
            Eliminar bloque
          </button>
        </div>
      </div>
      {/* Ítems hijos: zona indentada y fondo distinto */}
      <div className="border-t border-[var(--app-border)] bg-[var(--app-bg)]/60 p-3 pl-6">
        <SortableContext
          items={group.items.map((it) => it.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {group.items.map((item) => (
              <SortableDayItem
                key={item.id}
                item={item}
                onUpdate={(updates) => onUpdateItem(item.id, updates)}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>
        <button
          type="button"
          onClick={onAddItem}
          className="mt-3 w-full rounded-lg border border-dashed border-[var(--app-border)] py-2 text-sm text-[var(--app-fg)]/60 hover:border-[var(--app-gold)]/50 hover:text-[var(--app-gold)]"
        >
          + Añadir ítem
        </button>
      </div>
    </div>
  );
}

export default function RoutineEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    getRoutineTemplate(token, id)
      .then((r) => {
        const days: Routine["days"] = {};
        for (const key of DAY_KEYS) {
          const groups = normalizeDayToGroups(r.days[key]);
          days[key] = { groups };
        }
        setRoutine({ ...r, days });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function getDayGroups(dayKey: string): DayGroup[] {
    return routine?.days[dayKey]?.groups ?? [];
  }

  function updateDayGroups(dayKey: string, groups: DayGroup[]) {
    if (!routine) return;
    setRoutine({
      ...routine,
      days: {
        ...routine.days,
        [dayKey]: { groups },
      },
    });
  }

  function updateGroup(dayKey: string, groupId: string, updates: Partial<Pick<DayGroup, "title" | "time">>) {
    const groups = getDayGroups(dayKey).map((g) =>
      g.id === groupId ? { ...g, ...updates } : g
    );
    updateDayGroups(dayKey, groups);
  }

  function updateGroupItems(dayKey: string, groupId: string, items: DayItem[]) {
    const groups = getDayGroups(dayKey).map((g) =>
      g.id === groupId ? { ...g, items } : g
    );
    updateDayGroups(dayKey, groups);
  }

  function addGroup(dayKey: string) {
    const groups = getDayGroups(dayKey);
    updateDayGroups(dayKey, [
      ...groups,
      { id: crypto.randomUUID(), title: "", time: undefined, items: [] },
    ]);
  }

  function removeGroup(dayKey: string, groupId: string) {
    updateDayGroups(dayKey, getDayGroups(dayKey).filter((g) => g.id !== groupId));
  }

  function addItem(dayKey: string, groupId: string) {
    const groups = getDayGroups(dayKey);
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroupItems(dayKey, groupId, [
      ...group.items,
      { id: crypto.randomUUID(), type: "text", content: "" },
    ]);
  }

  function updateItem(dayKey: string, groupId: string, itemId: string, updates: Partial<DayItem>) {
    const group = getDayGroups(dayKey).find((g) => g.id === groupId);
    if (!group) return;
    const items = group.items.map((it) =>
      it.id === itemId ? { ...it, ...updates } : it
    );
    updateGroupItems(dayKey, groupId, items);
  }

  function removeItem(dayKey: string, groupId: string, itemId: string) {
    const group = getDayGroups(dayKey).find((g) => g.id === groupId);
    if (!group) return;
    updateGroupItems(dayKey, groupId, group.items.filter((it) => it.id !== itemId));
  }

  function findGroupOrItem(id: string): { type: "group"; dayKey: string; index: number } | { type: "item"; dayKey: string; groupId: string; index: number } | null {
    if (!routine) return null;
    for (const dayKey of DAY_KEYS) {
      const groups = getDayGroups(dayKey);
      const gIndex = groups.findIndex((g) => g.id === id);
      if (gIndex >= 0) return { type: "group", dayKey, index: gIndex };
      for (let gi = 0; gi < groups.length; gi++) {
        const iIndex = groups[gi].items.findIndex((it) => it.id === id);
        if (iIndex >= 0) return { type: "item", dayKey, groupId: groups[gi].id, index: iIndex };
      }
    }
    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !routine) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeLoc = findGroupOrItem(activeId);
    const overLoc = findGroupOrItem(overId);
    if (!activeLoc || !overLoc) return;

    if (activeLoc.type === "group" && overLoc.type === "group" && activeLoc.dayKey === overLoc.dayKey) {
      const groups = getDayGroups(activeLoc.dayKey);
      const next = arrayMove(groups, activeLoc.index, overLoc.index);
      updateDayGroups(activeLoc.dayKey, next);
      return;
    }

    if (
      activeLoc.type === "item" &&
      overLoc.type === "item" &&
      activeLoc.dayKey === overLoc.dayKey &&
      activeLoc.groupId === overLoc.groupId
    ) {
      const group = getDayGroups(activeLoc.dayKey).find((g) => g.id === activeLoc.groupId);
      if (!group) return;
      const next = arrayMove(group.items, activeLoc.index, overLoc.index);
      updateGroupItems(activeLoc.dayKey, activeLoc.groupId, next);
    }
  }

  async function handleSave() {
    if (!token || !routine) return;
    setSaving(true);
    setError("");
    try {
      await updateRoutineTemplate(token, routine.id, {
        weekLabel: routine.weekLabel,
        year: routine.year,
        weekNumber: routine.weekNumber,
        days: routine.days,
      } as UpdateRoutineDto);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !routine) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">
          {loading ? "Cargando…" : "Rutina no encontrada"}
        </p>
      </div>
    );
  }

  const todayKey = getTodayDayKey();

  function scrollToDay(dayKey: string) {
    document.getElementById(`day-${dayKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/routines"
            className="text-sm font-medium text-[var(--app-fg)]/70 hover:text-[var(--app-gold)]"
          >
            Volver a rutinas
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
            {routine.weekLabel} {routine.year === 0 ? "(Plantilla)" : `(${routine.year})`}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-1" aria-label="Semana L-D">
            {DAY_KEYS.map((dayKey) => (
              <button
                key={dayKey}
                type="button"
                onClick={() => scrollToDay(dayKey)}
                className={`min-w-[2.25rem] rounded-md px-2 py-1.5 text-xs font-semibold tabular-nums transition ${
                  dayKey === todayKey
                    ? "bg-[var(--app-gold)] text-[var(--app-black)]"
                    : "text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
                }`}
                title={DAY_LABELS[dayKey]}
              >
                {DAY_LABELS_SHORT[dayKey]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--app-gold)] px-4 py-2 text-sm font-medium text-[var(--app-black)] transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[max-content] grid-cols-7 gap-3">
            {DAY_KEYS.map((dayKey) => {
              const groups = getDayGroups(dayKey);
              const groupIds = groups.map((g) => g.id);
              const isToday = dayKey === todayKey;
              return (
                <section
                  id={`day-${dayKey}`}
                  key={dayKey}
                  className={`flex min-h-[320px] min-w-[200px] max-w-[280px] flex-col rounded-xl border scroll-mt-4 ${
                    isToday
                      ? "border-[var(--app-gold)]/60 bg-[var(--app-gold)]/5"
                      : "border-[var(--app-border)] bg-[var(--app-surface)]"
                  }`}
                >
                  <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--app-border)] bg-inherit px-3 py-2.5">
                    <h2
                      title={DAY_LABELS[dayKey]}
                      className={`text-center text-xs font-semibold uppercase tracking-wider ${
                        isToday ? "text-[var(--app-gold)]" : "text-[var(--app-fg)]/80"
                      }`}
                    >
                      {DAY_LABELS_SHORT[dayKey]}
                    </h2>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
                    <SortableContext
                      items={groupIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {groups.map((group) => (
                        <SortableDayGroup
                          key={group.id}
                          dayKey={dayKey}
                          group={group}
                          onUpdateGroup={(updates) => updateGroup(dayKey, group.id, updates)}
                          onRemoveGroup={() => removeGroup(dayKey, group.id)}
                          onUpdateItems={(items) => updateGroupItems(dayKey, group.id, items)}
                          onAddItem={() => addItem(dayKey, group.id)}
                          onUpdateItem={(itemId, updates) => updateItem(dayKey, group.id, itemId, updates)}
                          onRemoveItem={(itemId) => removeItem(dayKey, group.id, itemId)}
                        />
                      ))}
                    </SortableContext>
                    <button
                      type="button"
                      onClick={() => addGroup(dayKey)}
                      className="mt-auto shrink-0 rounded-lg border border-dashed border-[var(--app-border)] py-2 text-xs text-[var(--app-fg)]/60 hover:border-[var(--app-gold)]/50 hover:text-[var(--app-gold)]"
                    >
                      + Añadir bloque
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
