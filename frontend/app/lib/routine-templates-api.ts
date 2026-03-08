import { getBaseUrl, getAuthHeaders } from "./api";
import type { DayContent, Routine, UpdateRoutineDto } from "./routines-api";

const BASE = () => `${getBaseUrl()}/routine-templates`;

export async function getRoutineTemplatesByWorkspace(
  token: string,
  workspaceId: string
): Promise<Routine[]> {
  const res = await fetch(`${getBaseUrl()}/workspaces/${workspaceId}/routine-templates`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar rutinas del workspace");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getRoutineTemplates(token: string, workspaceId?: string): Promise<Routine[]> {
  const url = workspaceId
    ? `${getBaseUrl()}/workspaces/${workspaceId}/routine-templates`
    : `${BASE()}?workspaceId=`;
  const res = await fetch(workspaceId ? url : `${BASE()}`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar rutinas");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getRoutineTemplate(token: string, id: string): Promise<Routine> {
  const res = await fetch(`${BASE()}/${id}`, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar rutina");
  return res.json();
}

export async function updateRoutineTemplate(
  token: string,
  id: string,
  dto: UpdateRoutineDto
): Promise<Routine> {
  const res = await fetch(`${BASE()}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar rutina");
  return res.json();
}

export type { DayContent, Routine, UpdateRoutineDto };
