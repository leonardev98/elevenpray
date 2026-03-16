/**
 * Workspace type registry (client).
 * Single source of truth for type ids and capabilities.
 * Mirrors backend workspace-type.registry.ts.
 */

export interface WorkspaceTypeCapabilities {
  hasRoutine: boolean;
  hasDashboardWidgets?: boolean;
  hasEntries?: boolean;
  hasProductVault?: boolean;
  hasCheckins?: boolean;
  hasProgressPhotos?: boolean;
  hasInsights?: boolean;
  hasRoutineSlots?: boolean;
  /** Expert/mentor/coach consultation (reusable across skincare, fitness, career, etc.). */
  hasExpertConsultation?: boolean;
  /** Educational articles and guides (knowledge hub). */
  hasKnowledgeHub?: boolean;
  /** Video tutorials and guides. */
  hasVideoGuides?: boolean;
  /** Routine/product reminders (morning, night, reapply). */
  hasReminders?: boolean;
  /** Community insights: popular routines, trending products. */
  hasCommunityInsights?: boolean;
}

export type WorkspaceCategoryId = "vida_personal" | "trabajo" | "estudios";

/** Categoría padre en el modal de nuevo workspace. Alineado con BD workspace_type_domains. */
export type WorkspaceParentId = "wellness" | "study" | "work" | "general";

export interface WorkspaceTypeDefinition {
  id: string;
  label: string;
  /** Categoría para el aside: Vida personal, Trabajo, Estudios */
  category: WorkspaceCategoryId;
  /** Categoría padre para agrupar en UI (Bienestar, Estudios, Trabajo, General) */
  domain: WorkspaceParentId;
  capabilities: WorkspaceTypeCapabilities;
  sortOrder: number;
}

const CATEGORY_LABELS: Record<WorkspaceCategoryId, string> = {
  vida_personal: "Vida personal",
  trabajo: "Trabajo",
  estudios: "Estudios",
};

export const WORKSPACE_PARENT_IDS: WorkspaceParentId[] = ["wellness", "study", "work", "general"];

/** Tipos que son solo tipo (sin subtipo): se elige el tipo y se crea el workspace con ese type. */
const WELLNESS_TYPE_IDS: WorkspaceTypeId[] = ["skincare", "fitness", "nutrition", "sleep", "mental_health"];

/** Para study, work, general: el workspace tiene un tipo + subtipo (se elige desde API). */
const PARENT_TO_WORKSPACE_TYPE: Record<Exclude<WorkspaceParentId, "wellness">, WorkspaceTypeId> = {
  study: "study",
  work: "work",
  general: "general",
};

export function getWellnessTypeIds(): WorkspaceTypeId[] {
  return [...WELLNESS_TYPE_IDS];
}

export function getWorkspaceTypeForParent(parentId: WorkspaceParentId): WorkspaceTypeId | null {
  return PARENT_TO_WORKSPACE_TYPE[parentId] ?? null;
}

/** Si la categoría padre usa subtipos desde API (study, work, general). */
export function parentUsesSubtypes(parentId: WorkspaceParentId): boolean {
  return parentId !== "wellness";
}

const DEFINITIONS: WorkspaceTypeDefinition[] = [
  {
    id: "skincare",
    label: "Skincare",
    category: "vida_personal",
    domain: "wellness",
    capabilities: {
      hasRoutine: true,
      hasProductVault: true,
      hasCheckins: true,
      hasProgressPhotos: true,
      hasInsights: true,
      hasRoutineSlots: true,
      hasExpertConsultation: true,
      hasKnowledgeHub: true,
      hasVideoGuides: true,
      hasReminders: true,
      hasCommunityInsights: true,
    },
    sortOrder: 0,
  },
  { id: "study", label: "Study", category: "estudios", domain: "study", capabilities: { hasRoutine: false, hasDashboardWidgets: true }, sortOrder: 1 },
  { id: "work", label: "Work", category: "trabajo", domain: "work", capabilities: { hasRoutine: false, hasDashboardWidgets: true }, sortOrder: 2 },
  { id: "fitness", label: "Fitness", category: "vida_personal", domain: "wellness", capabilities: { hasRoutine: true }, sortOrder: 3 },
  { id: "general", label: "General", category: "vida_personal", domain: "general", capabilities: { hasRoutine: true }, sortOrder: 4 },
  { id: "nutrition", label: "Nutrition", category: "vida_personal", domain: "wellness", capabilities: { hasRoutine: true }, sortOrder: 5 },
  { id: "sleep", label: "Sleep", category: "vida_personal", domain: "wellness", capabilities: { hasRoutine: true }, sortOrder: 6 },
  { id: "mental_health", label: "Mental Health", category: "vida_personal", domain: "wellness", capabilities: { hasRoutine: true }, sortOrder: 7 },
];

export const WORKSPACE_TYPE_IDS = DEFINITIONS.map((d) => d.id) as readonly string[];
export type WorkspaceTypeId = (typeof WORKSPACE_TYPE_IDS)[number];

const byId = new Map<string, WorkspaceTypeDefinition>(DEFINITIONS.map((d) => [d.id, d]));
const LEGACY_ALIASES: Record<string, string> = {
  university: "study",
};

function resolveTypeId(typeId: string): string {
  return LEGACY_ALIASES[typeId] ?? typeId;
}

export function getWorkspaceType(id: string): WorkspaceTypeDefinition | undefined {
  return byId.get(resolveTypeId(id));
}

export function getWorkspaceCategoryLabel(categoryId: WorkspaceCategoryId): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId;
}

/** Returns parent/domain code for a workspace type (for grouping in sidebar). */
export function getWorkspaceDomain(typeId: string): WorkspaceParentId {
  const def = byId.get(resolveTypeId(typeId));
  return def?.domain ?? "general";
}

export function getAllWorkspaceTypes(): WorkspaceTypeDefinition[] {
  return [...DEFINITIONS];
}

/** Whether this workspace type has the routine capability (weekly routine editor). */
export function hasRoutineCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasRoutine === true;
}

export function hasProductVaultCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasProductVault === true;
}

export function hasCheckinsCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasCheckins === true;
}

export function hasProgressPhotosCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasProgressPhotos === true;
}

export function hasInsightsCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasInsights === true;
}

export function hasRoutineSlotsCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasRoutineSlots === true;
}

export function hasExpertConsultationCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasExpertConsultation === true;
}

export function hasKnowledgeHubCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasKnowledgeHub === true;
}

export function hasVideoGuidesCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasVideoGuides === true;
}

export function hasRemindersCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasReminders === true;
}

export function hasCommunityInsightsCapability(typeId: string): boolean {
  const def = byId.get(resolveTypeId(typeId));
  return def?.capabilities?.hasCommunityInsights === true;
}
