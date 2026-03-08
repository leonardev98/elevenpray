/**
 * Workspace type registry (code-based).
 * Single source of truth for type ids and capabilities.
 * Replaces hardcoded WORKSPACE_TYPES and hasRoutineTypes arrays.
 */

export interface WorkspaceTypeCapabilities {
  hasRoutine: boolean;
  hasDashboardWidgets?: boolean;
  hasEntries?: boolean;
}

export interface WorkspaceTypeDefinition {
  id: string;
  label: string;
  capabilities: WorkspaceTypeCapabilities;
  defaultSpaces?: Array<{ title: string; position: number }>;
  sortOrder: number;
}

const DEFINITIONS: WorkspaceTypeDefinition[] = [
  { id: 'skincare', label: 'Skincare', capabilities: { hasRoutine: true }, sortOrder: 0 },
  { id: 'university', label: 'Universidad', capabilities: { hasRoutine: false }, sortOrder: 1 },
  { id: 'work', label: 'Trabajo', capabilities: { hasRoutine: false, hasDashboardWidgets: true }, sortOrder: 2 },
  { id: 'fitness', label: 'Fitness', capabilities: { hasRoutine: true }, sortOrder: 3 },
  { id: 'general', label: 'General', capabilities: { hasRoutine: true }, sortOrder: 4 },
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

export function hasRoutineCapability(typeId: string): boolean {
  const def = byId.get(typeId);
  return def?.capabilities?.hasRoutine === true;
}

export function getValidTypeIds(): readonly string[] {
  return WORKSPACE_TYPE_IDS;
}
