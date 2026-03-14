import type { DayKey } from "./types";
import type { RoutineSlot } from "../routines-api";

export type RoutineIntelligenceSeverity = "warning" | "conflict" | "recommendation";

export interface AffectedRoutineItem {
  itemId: string;
  dayKey: DayKey;
  slot: RoutineSlot;
}

export interface SuggestedAction {
  type: "remove_item" | "move_item" | "open_add_product";
  labelKey: string;
  itemId?: string;
  dayKey?: DayKey;
  slot?: RoutineSlot;
  toDayKey?: DayKey;
  toSlot?: RoutineSlot;
  suggestedStepType?: string;
}

export interface RoutineIntelligenceIssue {
  id: string;
  type: "duplicate_function" | "ingredient_conflict" | "structure";
  severity: RoutineIntelligenceSeverity;
  messageKey?: string;
  message?: string;
  affectedItems: AffectedRoutineItem[];
  ingredientA?: string;
  ingredientB?: string;
  suggestedActions?: SuggestedAction[];
  /** For duplicate_function: day and slot where the duplicate occurs. */
  contextDayKey?: DayKey;
  contextSlot?: RoutineSlot;
  /** For duplicate_function: step type (e.g. cleanser). */
  contextStepType?: string;
  /** For duplicate_function: product names in that slot. */
  contextProductNames?: string[];
  /** For ingredient_conflict: each day/slot where this conflict appears. */
  conflictOccurrences?: ConflictOccurrence[];
}

/** One occurrence of an ingredient conflict in a given day/slot. */
export interface ConflictOccurrence {
  dayKey: DayKey;
  slot: RoutineSlot;
  productNames: string[];
  /** Which ingredient each product has: A = ingredientA (e.g. Vit. C), B = ingredientB (e.g. Niacinamide). */
  productDetails?: { name: string; ingredient: "A" | "B" }[];
}

/** Reason to show in UI (translate messageKey or use message as-is). */
export interface ItemSeverityReason {
  messageKey?: string;
  message?: string;
}

export interface RoutineIntelligenceResult {
  warnings: RoutineIntelligenceIssue[];
  conflicts: RoutineIntelligenceIssue[];
  recommendations: RoutineIntelligenceIssue[];
  /** Map itemId -> highest severity for step highlighting (warning | conflict). */
  itemSeverityMap: Record<string, "warning" | "conflict">;
  /** Map itemId -> reason for severity (for hover tooltip). */
  itemSeverityReasonsMap: Record<string, ItemSeverityReason>;
}
