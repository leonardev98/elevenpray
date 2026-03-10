import type { CatalogProductApi } from "../catalog-api";
import type {
  DayContent,
  DayGroup,
  DayItem,
  Routine,
  RoutineMetadata,
  RoutineSlot,
  WeeklyIntent,
} from "../routines-api";
import type { ConflictResultApi } from "../ingredient-conflicts-api";
import type { ProductCategory, WorkspaceProductApi } from "../workspace-products-api";

export type RoutineStepType =
  | "cleanser"
  | "toner"
  | "serum"
  | "treatment"
  | "eye"
  | "moisturizer"
  | "sunscreen"
  | "mask"
  | "exfoliant"
  | "retinoid";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface RoutineBuilderState {
  routine: Routine;
  workspaceProducts: WorkspaceProductApi[];
  metadata: RoutineMetadata | null;
}

export interface SlotSuggestion {
  slot: RoutineSlot;
  stepType: RoutineStepType;
  reason: string;
}

export interface RoutineInsight {
  id: string;
  severity: "info" | "warning";
  message: string;
  dayKey?: DayKey;
  slot?: RoutineSlot;
}

export interface ConflictWarning {
  id: string;
  dayKey: DayKey;
  slot: RoutineSlot;
  message: string;
  severity: "warning" | "danger";
}

export interface RoutineConflictReport {
  warnings: ConflictWarning[];
  ingredientConflicts: ConflictResultApi[];
}

export interface AutoBuildOptions {
  mode: "scratch" | "smart-starter" | "skin-cycling" | "product-first";
  skinType?: RoutineMetadata["skinType"];
  goals?: string[];
  complexity?: RoutineMetadata["complexity"];
  preferredProducts?: WorkspaceProductApi[];
}

export interface AddProductInput {
  product: CatalogProductApi;
  slot: RoutineSlot;
  groupId: string;
  dayKey: DayKey;
}

export interface ProductRecommendation {
  product: CatalogProductApi;
  score: number;
  reason: string;
  preferredStepType: RoutineStepType;
}

export interface StepTypeMapping {
  productCategory: ProductCategory | string;
  stepType: RoutineStepType;
}

export interface BuildTemplateResult {
  days: Record<string, DayContent>;
  metadata: RoutineMetadata;
}

export interface GroupInsertResult {
  nextGroup: DayGroup;
  insertedItem: DayItem;
}

export interface WeeklyIntentSummary {
  dayKey: DayKey;
  intent: WeeklyIntent;
  label: string;
}
