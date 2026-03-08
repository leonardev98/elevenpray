import { getBaseUrl, getAuthHeaders } from "./api";

export interface SpaceApi {
  id: string;
  workspaceId: string;
  title: string;
  position: number;
  createdAt: string;
}

export async function getSpaces(token: string, workspaceId: string): Promise<SpaceApi[]> {
  const res = await fetch(`${getBaseUrl()}/workspaces/${workspaceId}/spaces`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar spaces");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createSpace(
  token: string,
  workspaceId: string,
  data: { title: string; position?: number }
): Promise<SpaceApi> {
  const res = await fetch(`${getBaseUrl()}/workspaces/${workspaceId}/spaces`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear space");
  return res.json();
}

export async function updateSpace(
  token: string,
  workspaceId: string,
  spaceId: string,
  data: { title?: string; position?: number }
): Promise<SpaceApi> {
  const res = await fetch(
    `${getBaseUrl()}/workspaces/${workspaceId}/spaces/${spaceId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar space");
  return res.json();
}

export async function deleteSpace(
  token: string,
  workspaceId: string,
  spaceId: string
): Promise<void> {
  const res = await fetch(
    `${getBaseUrl()}/workspaces/${workspaceId}/spaces/${spaceId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(token),
    }
  );
  if (!res.ok) throw new Error("Error al eliminar space");
}
