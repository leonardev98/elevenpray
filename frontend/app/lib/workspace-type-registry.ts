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
}

export interface WorkspaceTypeDefinition {
  id: string;
  label: string;
  capabilities: WorkspaceTypeCapabilities;
  sortOrder: number;
}

const DEFINITIONS: WorkspaceTypeDefinition[] = [
  {
    id: "skincare",
    label: "Skincare",
    capabilities: {
      hasRoutine: true,
      hasProductVault: true,
      hasCheckins: true,
      hasProgressPhotos: true,
      hasInsights: true,
      hasRoutineSlots: true,
      hasExpertConsultation: true,
    },
    sortOrder: 0,
  },
  { id: "university", label: "Universidad", capabilities: { hasRoutine: false }, sortOrder: 1 },
  { id: "work", label: "Trabajo", capabilities: { hasRoutine: false, hasDashboardWidgets: true }, sortOrder: 2 },
  { id: "fitness", label: "Fitness", capabilities: { hasRoutine: true }, sortOrder: 3 },
  { id: "general", label: "General", capabilities: { hasRoutine: true }, sortOrder: 4 },
];

export const WORKSPACE_TYPE_IDS = DEFINITIONS.map((d) => d.id) as readonly string[];
export type WorkspaceTypeId = (typeof WORKSPACE_TYPE_IDS)[number];

const byId = new Map<string, WorkspaceTypeDefinition>(DEFINITIONS.map((d) => [d.id, d]));

export function getWorkspaceType(id: string): WorkspaceTypeDefinition | undefined {
  return byId.get(id);
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
