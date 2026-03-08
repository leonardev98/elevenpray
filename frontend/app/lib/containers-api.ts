import { getBaseUrl, getAuthHeaders } from "./api";

export interface ContainerApi {
  id: string;
  pageId: string;
  title: string;
  position: number;
  createdAt: string;
}

export async function getContainers(
  token: string,
  pageId: string
): Promise<ContainerApi[]> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/containers`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar contenedores");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createContainer(
  token: string,
  pageId: string,
  data: { title?: string; position?: number }
): Promise<ContainerApi> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/containers`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear contenedor");
  return res.json();
}

export async function updateContainer(
  token: string,
  containerId: string,
  data: { title?: string; position?: number }
): Promise<ContainerApi> {
  const res = await fetch(`${getBaseUrl()}/containers/${containerId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar contenedor");
  return res.json();
}

export async function deleteContainer(
  token: string,
  containerId: string
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/containers/${containerId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar contenedor");
}
