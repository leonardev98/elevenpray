import { getBaseUrl, getAuthHeaders } from "./api";
import type { WorkspaceTypeId } from "./workspace-type-registry";

export type WorkspaceType = WorkspaceTypeId;

export interface WorkspaceApi {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  workspaceSubtypeId?: string | null;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

const WORKSPACES_URL = () => `${getBaseUrl()}/workspaces`;

export async function getWorkspaces(token: string): Promise<WorkspaceApi[]> {
  const res = await fetch(WORKSPACES_URL(), { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar workspaces");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getWorkspace(token: string, id: string): Promise<WorkspaceApi> {
  const res = await fetch(`${WORKSPACES_URL()}/${id}`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar workspace");
  return res.json();
}

export async function createWorkspace(
  token: string,
  name: string,
  workspaceType: WorkspaceTypeId,
  workspaceSubtypeId?: string | null
): Promise<WorkspaceApi> {
  const body: { name: string; workspaceType: WorkspaceTypeId; workspaceSubtypeId?: string } = {
    name: name.trim() || "Sin nombre",
    workspaceType,
  };
  if (workspaceSubtypeId) body.workspaceSubtypeId = workspaceSubtypeId;
  const res = await fetch(WORKSPACES_URL(), {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al crear workspace");
  }
  return res.json();
}

export async function updateWorkspace(
  token: string,
  id: string,
  data: { name?: string; sortOrder?: number }
): Promise<WorkspaceApi> {
  const res = await fetch(`${WORKSPACES_URL()}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar workspace");
  return res.json();
}

export async function deleteWorkspace(token: string, id: string): Promise<void> {
  const res = await fetch(`${WORKSPACES_URL()}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar workspace");
}

export async function getRoutineTemplatesByWorkspace(
  token: string,
  workspaceId: string
): Promise<unknown[]> {
  const res = await fetch(`${WORKSPACES_URL()}/${workspaceId}/routine-templates`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar rutinas del workspace");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
