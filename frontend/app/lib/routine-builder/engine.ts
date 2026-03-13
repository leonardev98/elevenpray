import type { CatalogProductApi } from "../catalog-api";
import type { ConflictResultApi } from "../ingredient-conflicts-api";
import type { Block, DayContent, DayGroup, DayItem, Routine, RoutineMetadata, RoutineSlot, WeeklyIntent } from "../routines-api";
import type { ProductCategory, WorkspaceProductApi } from "../workspace-products-api";
import type {
  AddProductInput,
  AutoBuildOptions,
  BuildTemplateResult,
  DayKey,
  GroupInsertResult,
  IntelligenceConflict,
  IntelligenceInsight,
  ProductRecommendation,
  RoutineAnalysis,
  RoutineConflictReport,
  RoutineInsight,
  RoutineStepType,
  RoutineSuggestion,
  SlotSuggestion,
  WeeklyIntentSummary,
} from "./types";

export const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const AM_STEP_ORDER: RoutineStepType[] = [
  "cleanser",
  "toner",
  "serum",
  "eye",
  "moisturizer",
  "sunscreen",
];

export const PM_STEP_ORDER: RoutineStepType[] = [
  "cleanser",
  "treatment",
  "exfoliant",
  "retinoid",
  "eye",
  "moisturizer",
  "mask",
];

const STEP_PRIORITY: Record<RoutineStepType, number> = {
  cleanser: 1,
  toner: 2,
  serum: 3,
  treatment: 4,
  exfoliant: 5,
  retinoid: 6,
  eye: 7,
  moisturizer: 8,
  mask: 9,
  sunscreen: 10,
};

const SLOT_LABEL: Record<RoutineSlot, string> = {
  am: "Morning Routine",
  pm: "Night Routine",
};

export function mapCategoryToStepType(category: ProductCategory | string): RoutineStepType {
  switch (category) {
    case "cleanser":
      return "cleanser";
    case "toner":
      return "toner";
    case "serum":
    case "essence":
      return "serum";
    case "retinoid":
      return "retinoid";
    case "exfoliant":
      return "exfoliant";
    case "eye_care":
      return "eye";
    case "moisturizer":
    case "oil":
    case "balm":
      return "moisturizer";
    case "mask":
      return "mask";
    case "sunscreen":
      return "sunscreen";
    case "spot_treatment":
    default:
      return "treatment";
  }
}

/** Map stepType to catalog API category for getCatalogProducts. */
export function stepTypeToCategory(stepType: RoutineStepType): string {
  switch (stepType) {
    case "cleanser":
      return "cleanser";
    case "toner":
      return "toner";
    case "serum":
      return "serum";
    case "treatment":
      return "spot_treatment";
    case "eye":
      return "eye_care";
    case "moisturizer":
      return "moisturizer";
    case "sunscreen":
      return "sunscreen";
    case "mask":
      return "mask";
    case "exfoliant":
      return "exfoliant";
    case "retinoid":
      return "retinoid";
    default:
      return "serum";
  }
}

export function normalizeRoutineDays(days: Record<string, DayContent> | undefined): Record<string, DayContent> {
  const next: Record<string, DayContent> = {};
  for (const dayKey of DAY_KEYS) {
    const day = days?.[dayKey];
    if (!day) {
      next[dayKey] = { groups: [] };
      continue;
    }
    if (day.groups?.length) {
      next[dayKey] = {
        groups: day.groups.map((group) => ({
          ...group,
          items: group.items ?? [],
        })),
      };
      continue;
    }
    const items = day.items?.length
      ? day.items
      : (day.blocks ?? []).map((block, index) => ({
          id: (block as Block & { id?: string }).id ?? `${dayKey}-legacy-${index}`,
          type: block.type,
          content: block.content,
        }));
    next[dayKey] = {
      groups: items.length
        ? [
            {
              id: `${dayKey}-legacy-group`,
              title: "Legacy",
              items,
            },
          ]
        : [],
    };
  }
  return next;
}

export function ensureAMPMGroups(days: Record<string, DayContent>): Record<string, DayContent> {
  const next: Record<string, DayContent> = {};
  for (const dayKey of DAY_KEYS) {
    const groups = [...(days[dayKey]?.groups ?? [])];
    const hasAm = groups.some((group) => group.slot === "am");
    const hasPm = groups.some((group) => group.slot === "pm");
    if (!hasAm) {
      groups.unshift({
        id: `${dayKey}-am`,
        title: SLOT_LABEL.am,
        slot: "am",
        items: [],
      });
    }
    if (!hasPm) {
      groups.push({
        id: `${dayKey}-pm`,
        title: SLOT_LABEL.pm,
        slot: "pm",
        items: [],
      });
    }
    next[dayKey] = { groups };
  }
  return next;
}

export function autoArrangeGroupByDermOrder(group: DayGroup): DayGroup {
  const order = group.slot === "pm" ? PM_STEP_ORDER : AM_STEP_ORDER;
  const priority = (item: DayItem) => {
    const key = (item.stepType as RoutineStepType | undefined) ?? "treatment";
    const idx = order.indexOf(key);
    return idx === -1 ? STEP_PRIORITY[key] + 100 : idx + 1;
  };
  const items = [...group.items].sort((a, b) => priority(a) - priority(b));
  return { ...group, items };
}

export function autoArrangeDayGroups(groups: DayGroup[]): DayGroup[] {
  return groups
    .map(autoArrangeGroupByDermOrder)
    .sort((a, b) => {
      const aPriority = a.slot === "am" ? 0 : a.slot === "pm" ? 1 : 2;
      const bPriority = b.slot === "am" ? 0 : b.slot === "pm" ? 1 : 2;
      return aPriority - bPriority;
    });
}

export function insertProductIntoSlot(group: DayGroup, product: CatalogProductApi): GroupInsertResult {
  const stepType = mapCategoryToStepType(product.category);
  const item: DayItem = {
    id: crypto.randomUUID(),
    type: "text",
    content: product.name,
    productId: product.id,
    stepType,
  };
  const sortedGroup = autoArrangeGroupByDermOrder({
    ...group,
    items: [...group.items, item],
  });
  return { nextGroup: sortedGroup, insertedItem: item };
}

const MAX_INSIGHTS = 4;

export function deriveRoutineInsights(routine: Routine): RoutineInsight[] {
  const raw: RoutineInsight[] = [];
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const amGroup = groups.find((group) => group.slot === "am");
    const pmGroup = groups.find((group) => group.slot === "pm");
    if (amGroup && !amGroup.items.some((item) => item.stepType === "sunscreen")) {
      raw.push({
        id: `am-sunscreen`,
        severity: "warning",
        message: "Sunscreen completes your AM routine.",
        dayKey,
        slot: "am",
      });
    }
    if (pmGroup && !pmGroup.items.some((item) => item.stepType === "cleanser")) {
      raw.push({
        id: `pm-cleanser`,
        severity: "info",
        message: "A gentle cleanser usually starts a strong PM flow.",
        dayKey,
        slot: "pm",
      });
    }
  }
  const seen = new Set<string>();
  const deduped = raw.filter((i) => {
    if (seen.has(i.message)) return false;
    seen.add(i.message);
    return true;
  });
  return deduped.slice(0, MAX_INSIGHTS);
}

export function detectRoutineConflicts(routine: Routine, ingredientConflicts: ConflictResultApi[]): RoutineConflictReport {
  const warnings: RoutineConflictReport["warnings"] = [];
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const pmGroup = groups.find((group) => group.slot === "pm");
    if (!pmGroup) continue;
    const hasRetinoid = pmGroup.items.some((item) => item.stepType === "retinoid");
    const hasExfoliant = pmGroup.items.some((item) => item.stepType === "exfoliant");
    if (hasRetinoid && hasExfoliant) {
      warnings.push({
        id: `${dayKey}-retinoid-exfoliant`,
        dayKey,
        slot: "pm",
        severity: "warning",
        message: "Consider separating retinoid and exfoliant nights.",
      });
    }
    const strongActives = pmGroup.items.filter(
      (item) => item.stepType === "retinoid" || item.stepType === "exfoliant" || item.stepType === "treatment"
    ).length;
    if (strongActives >= 3) {
      warnings.push({
        id: `${dayKey}-active-intensity`,
        dayKey,
        slot: "pm",
        severity: "warning",
        message: "This night routine may be too strong for sensitive skin.",
      });
    }
  }
  return { warnings, ingredientConflicts };
}

const SCORE_LABELS: Record<string, string> = {
  excellent: "Excellent routine",
  balanced: "Balanced routine",
  good: "Good routine",
  needs_improvement: "Needs improvement",
  weak: "Review recommended",
};

/** Score 0–10 from ingredient conflicts, actives, balance, AM/PM structure, skin type. */
export function deriveRoutineScore(
  routine: Routine,
  ingredientConflicts: IntelligenceConflict[],
  metadata: RoutineMetadata | null
): { score: number; scoreLabel: string } {
  let score = 10;
  const skinType = metadata?.skinType;

  // Ingredient conflicts: -0.8 per conflict, min 0
  const conflictPenalty = Math.min(2.5, ingredientConflicts.length * 0.8);
  score -= conflictPenalty;

  // Excessive actives (retinoid + exfoliant same night, or 3+ strong actives)
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const pmGroup = groups.find((g) => g.slot === "pm");
    if (!pmGroup) continue;
    const hasRetinoid = pmGroup.items.some((i) => i.stepType === "retinoid");
    const hasExfoliant = pmGroup.items.some((i) => i.stepType === "exfoliant");
    if (hasRetinoid && hasExfoliant) score -= 0.6;
    const strongCount = pmGroup.items.filter(
      (i) => i.stepType === "retinoid" || i.stepType === "exfoliant" || i.stepType === "treatment"
    ).length;
    if (strongCount >= 3) score -= 0.4;
  }

  // AM/PM structure: missing sunscreen AM or missing cleanser PM
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const amGroup = groups.find((g) => g.slot === "am");
    const pmGroup = groups.find((g) => g.slot === "pm");
    if (amGroup?.items?.length && !amGroup.items.some((i) => i.stepType === "sunscreen")) score -= 0.3;
    if (pmGroup?.items?.length && !pmGroup.items.some((i) => i.stepType === "cleanser")) score -= 0.2;
  }

  // Routine balance: at least some days with both AM and PM
  let daysWithContent = 0;
  for (const dayKey of DAY_KEYS) {
    const day = routine.days[dayKey];
    const hasAm = day?.groups?.some((g) => g.slot === "am" && (g.items?.length ?? 0) > 0);
    const hasPm = day?.groups?.some((g) => g.slot === "pm" && (g.items?.length ?? 0) > 0);
    if (hasAm || hasPm) daysWithContent += 1;
  }
  if (daysWithContent === 0) score = Math.min(score, 3);

  const clamped = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  let labelKey = "balanced";
  if (clamped >= 9) labelKey = "excellent";
  else if (clamped >= 7.5) labelKey = "balanced";
  else if (clamped >= 6) labelKey = "good";
  else if (clamped >= 4) labelKey = "needs_improvement";
  else labelKey = "weak";
  return { score: clamped, scoreLabel: SCORE_LABELS[labelKey] ?? labelKey };
}

const MAX_INTELLIGENCE_INSIGHTS = 6;

/** Insights for Routine Intelligence panel (info | warning | tip). */
export function deriveRoutineInsightsForIntelligence(routine: Routine): IntelligenceInsight[] {
  const raw: IntelligenceInsight[] = [];
  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const amGroup = groups.find((g) => g.slot === "am");
    const pmGroup = groups.find((g) => g.slot === "pm");

    if (amGroup?.items?.length) {
      const hasSunscreen = amGroup.items.some((i) => i.stepType === "sunscreen");
      if (hasSunscreen) {
        raw.push({
          id: `am-sunscreen-ok-${dayKey}`,
          severity: "info",
          message: "Sunscreen closes your morning routine correctly.",
          dayKey,
          slot: "am",
        });
      } else {
        raw.push({
          id: `am-sunscreen-miss-${dayKey}`,
          severity: "warning",
          message: "Add sunscreen to close your morning routine.",
          dayKey,
          slot: "am",
        });
      }
    }

    if (pmGroup?.items?.length) {
      if (!pmGroup.items.some((i) => i.stepType === "cleanser")) {
        raw.push({
          id: `pm-cleanser-${dayKey}`,
          severity: "info",
          message: "A gentle cleanser usually starts the night routine.",
          dayKey,
          slot: "pm",
        });
      }
      const exfoliants = pmGroup.items.filter((i) => i.stepType === "exfoliant");
      if (exfoliants.length >= 2) {
        raw.push({
          id: `pm-double-exfoliant-${dayKey}`,
          severity: "warning",
          message: "Two exfoliating products appear in the same night.",
          dayKey,
          slot: "pm",
        });
      }
      const hasRetinoid = pmGroup.items.some((i) => i.stepType === "retinoid");
      const hasExfoliant = pmGroup.items.some((i) => i.stepType === "exfoliant");
      if (hasRetinoid && hasExfoliant) {
        raw.push({
          id: `pm-retinoid-exfoliant-${dayKey}`,
          severity: "warning",
          message: "Consider separating retinoid and exfoliant nights.",
          dayKey,
          slot: "pm",
        });
      }
    }
  }

  // Tip: consider antioxidant in AM if no serum
  const anyAmWithoutSerum = DAY_KEYS.some((dayKey) => {
    const amGroup = routine.days[dayKey]?.groups?.find((g) => g.slot === "am");
    return amGroup?.items?.length && !amGroup.items.some((i) => i.stepType === "serum");
  });
  if (anyAmWithoutSerum) {
    raw.push({
      id: "tip-antioxidant-am",
      severity: "tip",
      message: "Consider adding an antioxidant serum in the morning.",
    });
  }

  const seen = new Set<string>();
  const deduped = raw.filter((i) => {
    if (seen.has(i.message)) return false;
    seen.add(i.message);
    return true;
  });
  return deduped.slice(0, MAX_INTELLIGENCE_INSIGHTS);
}

/** Conflicts from API are passed through as-is. */
export function getIngredientConflictsForAnalysis(ingredientConflicts: ConflictResultApi[]): IntelligenceConflict[] {
  return ingredientConflicts;
}

const MAX_SUGGESTIONS = 5;

/** Generate optimization suggestions with optional apply actions. */
export function generateRoutineSuggestions(
  routine: Routine,
  ingredientConflicts: IntelligenceConflict[]
): RoutineSuggestion[] {
  const suggestions: RoutineSuggestion[] = [];

  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const pmGroup = groups.find((g) => g.slot === "pm");
    if (!pmGroup) continue;
    const retinoidItem = pmGroup.items.find((i) => i.stepType === "retinoid");
    const exfoliantItem = pmGroup.items.find((i) => i.stepType === "exfoliant");
    if (retinoidItem && exfoliantItem) {
      const otherDay = DAY_KEYS.find((d) => d !== dayKey);
      if (otherDay) {
        suggestions.push({
          id: `move-retinoid-${dayKey}-${retinoidItem.id}`,
          message: `Move Retinol to ${otherDay.charAt(0).toUpperCase() + otherDay.slice(1)} night`,
          action: {
            type: "move_item",
            dayKey,
            slot: "pm",
            itemId: retinoidItem.id,
            toDayKey: otherDay,
            toSlot: "pm",
          },
        });
      }
    }
  }

  const exfoliantDays = DAY_KEYS.filter((dayKey) => {
    const groups = routine.days[dayKey]?.groups ?? [];
    const pmGroup = groups.find((g) => g.slot === "pm");
    return pmGroup?.items?.some((i) => i.stepType === "exfoliant") ?? false;
  });
  if (exfoliantDays.length > 2) {
    const keepDays: DayKey[] = exfoliantDays.slice(0, 2);
    suggestions.push({
      id: "reduce-exfoliant-freq",
      message: "Reduce exfoliant frequency to 2x per week",
      action: { type: "reduce_frequency", stepType: "exfoliant", keepDays },
    });
  }

  for (const dayKey of DAY_KEYS) {
    const groups = routine.days[dayKey]?.groups ?? [];
    const amGroup = groups.find((g) => g.slot === "am");
    if (amGroup?.items?.length && !amGroup.items.some((i) => i.stepType === "serum")) {
      const hasCleanser = amGroup.items.some((i) => i.stepType === "cleanser");
      if (hasCleanser) {
        suggestions.push({
          id: `add-hydrating-serum-${dayKey}`,
          message: "Add hydrating serum after cleanser",
          action: null,
        });
      }
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}

/** Single entry point: full routine analysis for Routine Intelligence. */
export function analyzeRoutine(
  routine: Routine,
  ingredientConflicts: IntelligenceConflict[],
  metadata: RoutineMetadata | null
): RoutineAnalysis {
  const { score, scoreLabel } = deriveRoutineScore(routine, ingredientConflicts, metadata);
  const insights = deriveRoutineInsightsForIntelligence(routine);
  const conflicts = getIngredientConflictsForAnalysis(ingredientConflicts);
  const suggestions = generateRoutineSuggestions(routine, ingredientConflicts);
  return { score, scoreLabel, insights, conflicts, suggestions };
}

/** Apply a suggestion action to the routine; returns updated routine or null. */
export function applySuggestionToRoutine(
  routine: Routine,
  suggestion: RoutineSuggestion
): Routine | null {
  const action = suggestion.action;
  if (!action) return null;

  if (action.type === "move_item") {
    const fromDay = routine.days[action.dayKey];
    const fromGroup = fromDay?.groups?.find(
      (g) => g.slot === action.slot && g.items?.some((i) => i.id === action.itemId)
    );
    const item = fromGroup?.items?.find((i) => i.id === action.itemId);
    if (!fromDay || !fromGroup || !item) return null;
    const toDay = routine.days[action.toDayKey] ?? { groups: [] };
    const toGroup = toDay.groups?.find((g) => g.slot === action.toSlot);
    if (!toGroup) return null;

    const nextFromItems = fromGroup.items.filter((i) => i.id !== action.itemId);
    const nextToItems = [...toGroup.items, { ...item }];
    const nextFromGroup = autoArrangeGroupByDermOrder({ ...fromGroup, items: nextFromItems });
    const nextToGroup = autoArrangeGroupByDermOrder({ ...toGroup, items: nextToItems });

    const nextDays = { ...routine.days };
    nextDays[action.dayKey] = {
      groups: (fromDay.groups ?? []).map((g) =>
        g.id === fromGroup.id ? nextFromGroup : g
      ),
    };
    nextDays[action.toDayKey] = {
      groups: (toDay.groups ?? []).map((g) =>
        g.id === toGroup.id ? nextToGroup : g
      ),
    };
    return { ...routine, days: nextDays };
  }

  if (action.type === "remove_item") {
    const day = routine.days[action.dayKey];
    const group = day?.groups?.find((g) => g.slot === action.slot);
    if (!day || !group) return null;
    const nextItems = group.items.filter((i) => i.id !== action.itemId);
    const nextGroup = { ...group, items: nextItems };
    const nextDays = {
      ...routine.days,
      [action.dayKey]: {
        groups: (day.groups ?? []).map((g) => (g.id === group.id ? nextGroup : g)),
      },
    };
    return { ...routine, days: nextDays };
  }

  if (action.type === "reduce_frequency") {
    const keepSet = new Set(action.keepDays);
    const nextDays = { ...routine.days };
    for (const dayKey of DAY_KEYS) {
      if (keepSet.has(dayKey)) continue;
      const day = nextDays[dayKey];
      if (!day?.groups) continue;
      nextDays[dayKey] = {
        groups: day.groups.map((group) => ({
          ...group,
          items: group.items.filter((i) => i.stepType !== action.stepType),
        })),
      };
    }
    return { ...routine, days: nextDays };
  }

  return null;
}

export function suggestStepTypesForSlot(slot: RoutineSlot): SlotSuggestion[] {
  const base = slot === "am" ? AM_STEP_ORDER : PM_STEP_ORDER;
  return base.map((stepType) => ({
    slot,
    stepType,
    reason: slot === "am" ? "Balanced morning progression" : "Recovery-first night progression",
  }));
}

export function recommendProductsForContext(
  products: CatalogProductApi[],
  slot: RoutineSlot,
  skinType?: RoutineMetadata["skinType"]
): ProductRecommendation[] {
  const allowed = new Set(slot === "am" ? AM_STEP_ORDER : PM_STEP_ORDER);
  return products
    .map((product) => {
      const stepType = mapCategoryToStepType(product.category);
      let score = allowed.has(stepType) ? 25 : 0;
      if (product.rating) score += Math.round(product.rating * 10);
      if (skinType && product.skinTypeCompatibility?.includes(skinType)) score += 20;
      if (slot === "am" && stepType === "sunscreen") score += 30;
      if (slot === "pm" && (stepType === "retinoid" || stepType === "exfoliant")) score += 10;
      return {
        product,
        score,
        reason: allowed.has(stepType) ? "Matches current routine context." : "Can still be used with adjustments.",
        preferredStepType: stepType,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildSlotGroup(slot: RoutineSlot, items: DayItem[] = []): DayGroup {
  return {
    id: crypto.randomUUID(),
    title: SLOT_LABEL[slot],
    slot,
    items: autoArrangeGroupByDermOrder({ id: "", title: "", slot, items }).items,
  };
}

function starterItems(slot: RoutineSlot): DayItem[] {
  if (slot === "am") {
    return [
      { id: crypto.randomUUID(), type: "text", content: "Gentle Cleanser", stepType: "cleanser" },
      { id: crypto.randomUUID(), type: "text", content: "Hydrating Serum", stepType: "serum" },
      { id: crypto.randomUUID(), type: "text", content: "Barrier Moisturizer", stepType: "moisturizer" },
      { id: crypto.randomUUID(), type: "text", content: "Daily Sunscreen SPF50", stepType: "sunscreen" },
    ];
  }
  return [
    { id: crypto.randomUUID(), type: "text", content: "Gentle Cleanser", stepType: "cleanser" },
    { id: crypto.randomUUID(), type: "text", content: "Targeted Treatment", stepType: "treatment" },
    { id: crypto.randomUUID(), type: "text", content: "Barrier Moisturizer", stepType: "moisturizer" },
  ];
}

type SkinType = RoutineMetadata["skinType"];

function smartStarterItems(slot: RoutineSlot, skinType?: SkinType, goals?: string[]): DayItem[] {
  const hasAcne = goals?.some((g) => g.toLowerCase().includes("acne"));
  const hasHydration = goals?.some((g) => g.toLowerCase().includes("hydration"));
  if (slot === "am") {
    const cleanser =
      skinType === "sensitive" || skinType === "dry"
        ? "Gentle Cleanser"
        : skinType === "oily" || skinType === "acne-prone"
          ? "Foaming Cleanser"
          : "Gentle Cleanser";
    const serum =
      skinType === "oily" || skinType === "acne-prone" || hasAcne
        ? "Niacinamide Serum"
        : skinType === "dry" || hasHydration
          ? "Hydrating Serum"
          : "Vitamin C Serum";
    const moisturizer =
      skinType === "oily" || skinType === "acne-prone"
        ? "Light Moisturizer"
        : skinType === "dry"
          ? "Barrier Moisturizer"
          : "Moisturizer";
    return [
      { id: crypto.randomUUID(), type: "text", content: cleanser, stepType: "cleanser" },
      { id: crypto.randomUUID(), type: "text", content: serum, stepType: "serum" },
      { id: crypto.randomUUID(), type: "text", content: moisturizer, stepType: "moisturizer" },
      { id: crypto.randomUUID(), type: "text", content: "Daily Sunscreen SPF50", stepType: "sunscreen" },
    ];
  }
  const cleanser =
    skinType === "sensitive" || skinType === "dry"
      ? "Gentle Cleanser"
      : skinType === "oily" || skinType === "acne-prone"
        ? "Foaming Cleanser"
        : "Gentle Cleanser";
  const treatment =
    skinType === "oily" || skinType === "acne-prone" || hasAcne
      ? "Niacinamide or Treatment"
      : "Retinol or Niacinamide";
  const moisturizer =
    skinType === "oily" || skinType === "acne-prone"
      ? "Light Moisturizer"
      : skinType === "dry"
        ? "Barrier Moisturizer"
        : "Moisturizer";
  return [
    { id: crypto.randomUUID(), type: "text", content: cleanser, stepType: "cleanser" },
    { id: crypto.randomUUID(), type: "text", content: treatment, stepType: "treatment" },
    { id: crypto.randomUUID(), type: "text", content: moisturizer, stepType: "moisturizer" },
  ];
}

export function buildStarterRoutine(options: AutoBuildOptions): BuildTemplateResult {
  const metadata: RoutineMetadata = {
    skinType: options.skinType,
    goals: options.goals ?? [],
    complexity: options.complexity ?? "balanced",
    weeklyIntents: {},
  };
  const days: Record<string, DayContent> = {};
  for (const dayKey of DAY_KEYS) {
    const useSmart = options.mode === "smart-starter";
    const amItems = useSmart
      ? smartStarterItems("am", options.skinType, options.goals)
      : starterItems("am");
    const pmItems = useSmart
      ? smartStarterItems("pm", options.skinType, options.goals)
      : starterItems("pm");
    if (options.mode === "skin-cycling") {
      const intentSequence: WeeklyIntent[] = [
        "exfoliation",
        "retinoid",
        "recovery",
        "recovery",
      ];
      const intent = intentSequence[DAY_KEYS.indexOf(dayKey) % intentSequence.length];
      if (intent) metadata.weeklyIntents![dayKey] = intent;
      if (intent === "retinoid") {
        pmItems.splice(1, 0, {
          id: crypto.randomUUID(),
          type: "text",
          content: "Retinoid Treatment",
          stepType: "retinoid",
        });
      } else if (intent === "exfoliation") {
        pmItems.splice(1, 0, {
          id: crypto.randomUUID(),
          type: "text",
          content: "Exfoliating Treatment",
          stepType: "exfoliant",
        });
      }
    }
    if (options.mode === "product-first" && options.preferredProducts?.length) {
      const mapped = options.preferredProducts
        .slice(0, 5)
        .map((product) => ({
          id: crypto.randomUUID(),
          type: "text" as const,
          content: product.name,
          productId: product.id,
          stepType: mapCategoryToStepType(product.category),
        }));
      const amPreferred = mapped.filter((item) => item.stepType !== "retinoid" && item.stepType !== "exfoliant");
      const pmPreferred = mapped.filter((item) => item.stepType !== "sunscreen");
      days[dayKey] = {
        groups: [buildSlotGroup("am", amPreferred), buildSlotGroup("pm", pmPreferred)],
      };
      continue;
    }
    days[dayKey] = {
      groups: [buildSlotGroup("am", amItems), buildSlotGroup("pm", pmItems)],
    };
  }
  return { days, metadata };
}

export function getWeeklyIntentSummary(metadata: RoutineMetadata | null | undefined): WeeklyIntentSummary[] {
  const intents = metadata?.weeklyIntents;
  if (!intents) return [];
  return DAY_KEYS.flatMap((dayKey) => {
    const intent = intents[dayKey];
    if (!intent) return [];
    const label =
      intent === "retinoid"
        ? "Retinoid Night"
        : intent === "exfoliation"
          ? "Exfoliation Night"
          : intent === "recovery"
            ? "Recovery"
            : intent === "hydration"
              ? "Hydration Focus"
              : "Rest";
    return [{ dayKey, intent, label }];
  });
}

export function rebuildRoutineForBuilder(routine: Routine): Routine {
  const normalized = normalizeRoutineDays(routine.days);
  const withSlots = ensureAMPMGroups(normalized);
  const days: Record<string, DayContent> = {};
  for (const dayKey of DAY_KEYS) {
    days[dayKey] = {
      groups: autoArrangeDayGroups(withSlots[dayKey].groups ?? []),
    };
  }
  return { ...routine, days };
}

/** Returns true if the given product (by id or by name) is already in the specified day and slot. */
export function isProductInDaySlot(
  routine: Routine,
  dayKey: string,
  slot: RoutineSlot,
  productIdOrName: string
): boolean {
  const day = routine.days[dayKey];
  if (!day?.groups) return false;
  const group = day.groups.find((g) => g.slot === slot);
  if (!group?.items?.length) return false;
  return group.items.some(
    (item) => item.productId === productIdOrName || item.content === productIdOrName
  );
}

export function upsertCatalogProductInRoutine(
  routine: Routine,
  input: AddProductInput
): Routine {
  const day = routine.days[input.dayKey] ?? { groups: [] };
  const groups = day.groups ?? [];
  const idx = groups.findIndex((group) => group.id === input.groupId);
  if (idx === -1) return routine;
  const inserted = insertProductIntoSlot(groups[idx], input.product);
  const nextGroups = groups.map((group, index) => (index === idx ? inserted.nextGroup : group));
  return {
    ...routine,
    days: {
      ...routine.days,
      [input.dayKey]: {
        groups: autoArrangeDayGroups(nextGroups),
      },
    },
  };
}
