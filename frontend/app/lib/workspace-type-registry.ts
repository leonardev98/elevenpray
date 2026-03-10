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

/** Dominio (padre) que agrupa tipos. Alineado con BD workspace_type_domains. */
export type WorkspaceDomainId = "wellness" | "work" | "studies" | "general";

export interface WorkspaceTypeDefinition {
  id: string;
  label: string;
  /** Categoría para el aside: Vida personal, Trabajo, Estudios */
  category: WorkspaceCategoryId;
  /** Dominio para agrupar en UI (Salud y bienestar, Trabajo, etc.) */
  domain: WorkspaceDomainId;
  capabilities: WorkspaceTypeCapabilities;
  sortOrder: number;
}

const CATEGORY_LABELS: Record<WorkspaceCategoryId, string> = {
  vida_personal: "Vida personal",
  trabajo: "Trabajo",
  estudios: "Estudios",
};

export const WORKSPACE_DOMAIN_IDS: WorkspaceDomainId[] = ["wellness", "work", "studies", "general"];

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
  { id: "university", label: "Universidad", category: "estudios", domain: "studies", capabilities: { hasRoutine: false }, sortOrder: 1 },
  { id: "work", label: "Trabajo", category: "trabajo", domain: "work", capabilities: { hasRoutine: false, hasDashboardWidgets: true }, sortOrder: 2 },
  { id: "fitness", label: "Fitness", category: "vida_personal", domain: "wellness", capabilities: { hasRoutine: true }, sortOrder: 3 },
  { id: "general", label: "General", category: "vida_personal", domain: "general", capabilities: { hasRoutine: true }, sortOrder: 4 },
];

export const WORKSPACE_TYPE_IDS = DEFINITIONS.map((d) => d.id) as readonly string[];
export type WorkspaceTypeId = (typeof WORKSPACE_TYPE_IDS)[number];

const byId = new Map<string, WorkspaceTypeDefinition>(DEFINITIONS.map((d) => [d.id, d]));

export function getWorkspaceType(id: string): WorkspaceTypeDefinition | undefined {
  return byId.get(id);
}

export function getWorkspaceCategoryLabel(categoryId: WorkspaceCategoryId): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId;
}

/** Returns domain code for a workspace type (for grouping in sidebar). */
export function getWorkspaceDomain(typeId: string): WorkspaceDomainId {
  const def = byId.get(typeId);
  return def?.domain ?? "general";
}

export function getAllWorkspaceTypes(): WorkspaceTypeDefinition[] {
  return [...DEFINITIONS];
}

/** Whether this workspace type has the routine capability (weekly routine editor). */
export function hasRoutineCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasRoutine === true;
}

export function hasProductVaultCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasProductVault === true;
}

export function hasCheckinsCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasCheckins === true;
}

export function hasProgressPhotosCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasProgressPhotos === true;
}

export function hasInsightsCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasInsights === true;
}

export function hasRoutineSlotsCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasRoutineSlots === true;
}

export function hasExpertConsultationCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasExpertConsultation === true;
}

export function hasKnowledgeHubCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasKnowledgeHub === true;
}

export function hasVideoGuidesCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasVideoGuides === true;
}

export function hasRemindersCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasReminders === true;
}

export function hasCommunityInsightsCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasCommunityInsights === true;
}
