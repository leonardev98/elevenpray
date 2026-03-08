/**
 * Topic types (legacy) and workspace types.
 * Workspace types now come from workspace-type-registry (capability-driven).
 */

import {
  getAllWorkspaceTypes,
  hasRoutineCapability,
  type WorkspaceTypeId,
} from "../../../../lib/workspace-type-registry";

export const TOPIC_TYPES = [
  { id: "rutina", label: "Rutina semanal (L-D)" },
  { id: "curso", label: "Curso / entradas por fecha" },
  { id: "notas", label: "Notas" },
  { id: "lista", label: "Lista" },
  { id: "meta", label: "Meta" },
  { id: "otro", label: "Otro" },
] as const;

export type TopicTypeId = (typeof TOPIC_TYPES)[number]["id"];

export interface Topic {
  id: string;
  title: string;
  type: TopicTypeId;
  sortOrder?: number;
  createdAt: number | string;
}

// Re-export from registry for backward compatibility
export const WORKSPACE_TYPES = getAllWorkspaceTypes().map((t) => ({
  id: t.id as WorkspaceTypeId,
  label: t.label,
}));

export type { WorkspaceTypeId };

/** @deprecated Use hasRoutineCapability(typeId) from workspace-type-registry instead */
export const WORKSPACE_TYPES_WITH_ROUTINE: WorkspaceTypeId[] = getAllWorkspaceTypes()
  .filter((t) => hasRoutineCapability(t.id))
  .map((t) => t.id as WorkspaceTypeId);

export { hasRoutineCapability };
