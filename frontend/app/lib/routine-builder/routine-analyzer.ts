import type { Routine, RoutineSlot } from "../routines-api";
import type { ConflictResultApi } from "../ingredient-conflicts-api";
import type { WorkspaceProductApi } from "../workspace-products-api";
import { DAY_KEYS } from "./engine";
import type { DayKey } from "./types";
import type {
  RoutineIntelligenceResult,
  RoutineIntelligenceIssue,
  AffectedRoutineItem,
  SuggestedAction,
  ItemSeverityReason,
  ConflictOccurrence,
} from "./routine-analyzer-types";

function normIngredient(s: string): string {
  return s.trim().toLowerCase();
}

/** Build map productId -> normalized ingredients list. */
function productIngredientsMap(products: WorkspaceProductApi[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const p of products) {
    const ing = (p.mainIngredients ?? []).map(normIngredient).filter(Boolean);
    if (ing.length) map.set(p.id, ing);
  }
  return map;
}

/** Check if product has this ingredient (normalized). */
function productHasIngredient(ingredients: string[], needle: string): boolean {
  const n = normIngredient(needle);
  return ingredients.some((i) => i.includes(n) || n.includes(i));
}

/**
 * Routine Intelligence Engine: analyzes routine for duplicates, ingredient conflicts, and structure.
 * Returns warnings, conflicts, recommendations and a map of itemId -> severity for UI highlighting.
 */
export function analyzeRoutineIntelligence(
  routine: Routine,
  workspaceProducts: WorkspaceProductApi[],
  ingredientConflictsFromApi: ConflictResultApi[]
): RoutineIntelligenceResult {
  const warnings: RoutineIntelligenceIssue[] = [];
  const conflicts: RoutineIntelligenceIssue[] = [];
  const recommendations: RoutineIntelligenceIssue[] = [];
  const itemSeverityMap: Record<string, "warning" | "conflict"> = {};
  const itemSeverityReasonsMap: Record<string, ItemSeverityReason> = {};

  const productToIngredients = productIngredientsMap(workspaceProducts);

  // --- FEATURE 1: Duplicate function (same category twice in same moment) ---
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    for (const group of groups) {
      const slot = group.slot;
      if (!slot || !group.items?.length) continue;
      const byStepType = new Map<string, typeof group.items>();
      for (const item of group.items) {
        const st = (item.stepType ?? "treatment") as string;
        if (!byStepType.has(st)) byStepType.set(st, []);
        byStepType.get(st)!.push(item);
      }
      for (const [stepType, items] of byStepType) {
        if (items.length < 2) continue;
        const affectedItems: AffectedRoutineItem[] = items.map((i) => ({
          itemId: i.id,
          dayKey: dayKey as DayKey,
          slot,
        }));
        const suggestedActions: SuggestedAction[] = items.slice(0, 2).flatMap((item) => [
          { type: "remove_item" as const, labelKey: "intelligenceActionRemove", itemId: item.id, dayKey: dayKey as DayKey, slot },
          ...(slot === "am"
            ? [{ type: "move_item" as const, labelKey: "intelligenceActionMoveToNight", itemId: item.id, dayKey: dayKey as DayKey, slot, toDayKey: dayKey as DayKey, toSlot: "pm" as const }]
            : []),
        ]);
        const id = `dup-${dayKey}-${slot}-${stepType}`;
        const productNames = items.map((i) => (i.content || "").trim()).filter(Boolean);
        warnings.push({
          id,
          type: "duplicate_function",
          severity: "warning",
          messageKey: "intelligenceDuplicateFunction",
          affectedItems,
          suggestedActions: suggestedActions.slice(0, 2),
          contextDayKey: dayKey as DayKey,
          contextSlot: slot,
          contextStepType: stepType,
          contextProductNames: productNames.length > 0 ? productNames : undefined,
        });
        for (const item of items) {
          if (!itemSeverityMap[item.id] || itemSeverityMap[item.id] === "warning") itemSeverityMap[item.id] = "warning";
          itemSeverityReasonsMap[item.id] = { messageKey: "intelligenceDuplicateFunction" };
        }
      }
    }
  }

  // --- FEATURE 2: Ingredient conflicts (map API conflicts to affected routine items) ---
  for (let i = 0; i < ingredientConflictsFromApi.length; i++) {
    const c = ingredientConflictsFromApi[i];
    const affectedItems: AffectedRoutineItem[] = [];
    for (const dayKey of DAY_KEYS) {
      const groups = routine.days[dayKey]?.groups ?? [];
      for (const group of groups) {
        if (!group.items?.length) continue;
        for (const item of group.items) {
          if (!item.productId) continue;
          const ing = productToIngredients.get(item.productId);
          if (!ing) continue;
          const hasA = productHasIngredient(ing, c.ingredientA);
          const hasB = productHasIngredient(ing, c.ingredientB);
          if (hasA || hasB) {
            affectedItems.push({ itemId: item.id, dayKey: dayKey as DayKey, slot: group.slot! });
          }
        }
      }
    }
    if (affectedItems.length === 0) continue;

    const byDaySlot = new Map<string, { dayKey: DayKey; slot: RoutineSlot; itemIds: string[] }>();
    for (const a of affectedItems) {
      const key = `${a.dayKey}-${a.slot}`;
      if (!byDaySlot.has(key)) byDaySlot.set(key, { dayKey: a.dayKey, slot: a.slot, itemIds: [] });
      const entry = byDaySlot.get(key)!;
      if (!entry.itemIds.includes(a.itemId)) entry.itemIds.push(a.itemId);
    }
    const conflictOccurrences: ConflictOccurrence[] = [];
    for (const { dayKey, slot, itemIds } of byDaySlot.values()) {
      const day = routine.days[dayKey];
      const group = day?.groups?.find((g) => g.slot === slot);
      const itemsInSlot = (group?.items ?? []).filter((item) => itemIds.includes(item.id));
      const productNames = itemsInSlot
        .map((item) => (item.content || "").trim())
        .filter(Boolean);
      if (productNames.length === 0) continue;

      const productDetails: { name: string; ingredient: "A" | "B" }[] = [];
      for (const item of itemsInSlot) {
        const name = (item.content || "").trim();
        if (!name) continue;
        const ing = item.productId ? productToIngredients.get(item.productId) : undefined;
        if (ing) {
          const hasA = productHasIngredient(ing, c.ingredientA);
          const hasB = productHasIngredient(ing, c.ingredientB);
          productDetails.push({ name, ingredient: hasA ? "A" : "B" });
        } else {
          productDetails.push({ name, ingredient: "A" });
        }
      }
      // Solo hay conflicto en este momento si en el mismo slot hay productos con ambos ingredientes.
      const hasIngredientA = productDetails.some((p) => p.ingredient === "A");
      const hasIngredientB = productDetails.some((p) => p.ingredient === "B");
      if (!hasIngredientA || !hasIngredientB) continue;
      conflictOccurrences.push({ dayKey, slot, productNames, productDetails });
    }

    const realConflictKeys = new Set(conflictOccurrences.map((o) => `${o.dayKey}-${o.slot}`));
    const otherSlotHasConflict = (d: DayKey, s: RoutineSlot) =>
      realConflictKeys.has(`${d}-${s === "am" ? "pm" : "am"}`);

    const suggestedActions: SuggestedAction[] = [];
    for (const occ of conflictOccurrences) {
      const { dayKey, slot } = occ;
      const entry = byDaySlot.get(`${dayKey}-${slot}`);
      const itemIds = entry?.itemIds ?? [];
      const itemId = itemIds[0];
      if (!itemId) continue;
      if (slot === "pm") {
        const day = routine.days[dayKey];
        const amGroup = day?.groups?.find((g) => g.slot === "am");
        const pmGroup = day?.groups?.find((g) => g.slot === "pm");
        const sourceItem = pmGroup?.items?.find((i) => i.id === itemId);
        const alreadyInMorning =
          sourceItem &&
          amGroup?.items?.some(
            (i) => i.productId === sourceItem.productId || (sourceItem.content && i.content === sourceItem.content)
          );
        const moveWouldLoop = otherSlotHasConflict(dayKey, "pm");
        if (alreadyInMorning || moveWouldLoop) {
          suggestedActions.push({
            type: "remove_item",
            labelKey: "intelligenceActionRemoveFromNight",
            itemId,
            dayKey,
            slot: "pm",
          });
        } else {
          suggestedActions.push({
            type: "move_item",
            labelKey: "intelligenceActionMoveToMorning",
            itemId,
            dayKey,
            slot: "pm",
            toDayKey: dayKey,
            toSlot: "am",
          });
        }
      } else {
        const day = routine.days[dayKey];
        const amGroup = day?.groups?.find((g) => g.slot === "am");
        const pmGroup = day?.groups?.find((g) => g.slot === "pm");
        const sourceItem = amGroup?.items?.find((i) => i.id === itemId);
        const alreadyInNight =
          sourceItem &&
          pmGroup?.items?.some(
            (i) => i.productId === sourceItem.productId || (sourceItem.content && i.content === sourceItem.content)
          );
        const moveWouldLoop = otherSlotHasConflict(dayKey, "am");
        if (alreadyInNight || moveWouldLoop) {
          suggestedActions.push({
            type: "remove_item",
            labelKey: "intelligenceActionRemoveFromMorning",
            itemId,
            dayKey,
            slot: "am",
          });
        } else {
          suggestedActions.push({
            type: "move_item",
            labelKey: "intelligenceActionMoveToNight",
            itemId,
            dayKey,
            slot: "am",
            toDayKey: dayKey,
            toSlot: "pm",
          });
        }
      }
    }
    const id = `ingredient-${c.ingredientA}-${c.ingredientB}-${i}`;
    conflicts.push({
      id,
      type: "ingredient_conflict",
      severity: "conflict",
      message: c.message,
      ingredientA: c.ingredientA,
      ingredientB: c.ingredientB,
      affectedItems,
      suggestedActions,
      conflictOccurrences: conflictOccurrences.length > 0 ? conflictOccurrences : undefined,
    });
    for (const a of affectedItems) {
      itemSeverityMap[a.itemId] = "conflict";
      itemSeverityReasonsMap[a.itemId] = { message: c.message };
    }
  }

  // --- FEATURE 3: Routine structure (e.g. morning without SPF) ---
  const daysAmWithoutSpf = DAY_KEYS.filter((dayKey) => {
    const groups = routine.days[dayKey]?.groups ?? [];
    const amGroup = groups.find((g) => g.slot === "am");
    return !!amGroup?.items?.length && !amGroup.items.some((i) => (i.stepType as string) === "sunscreen");
  });
  if (daysAmWithoutSpf.length > 0) {
    recommendations.push({
      id: "structure-am-no-spf",
      type: "structure",
      severity: "recommendation",
      messageKey: "intelligenceRecommendationSpf",
      affectedItems: [],
      suggestedActions: [
        {
          type: "open_add_product",
          labelKey: "suggestionAddProductCta",
          suggestedStepType: "sunscreen",
          dayKey: daysAmWithoutSpf[0] as DayKey,
          slot: "am",
        },
      ],
    });
  }

  return {
    warnings,
    conflicts,
    recommendations,
    itemSeverityMap,
    itemSeverityReasonsMap,
  };
}
