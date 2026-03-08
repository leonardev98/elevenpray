import { getBaseUrl, getAuthHeaders } from "./api";

export interface BlockApi {
  id: string;
  pageId: string;
  containerId: string | null;
  type: string;
  content: Record<string, unknown>;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export async function getBlocks(token: string, pageId: string): Promise<BlockApi[]> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/blocks`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar bloques");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createBlock(
  token: string,
  pageId: string,
  data: { type: string; content?: Record<string, unknown>; position?: number; containerId?: string | null }
): Promise<BlockApi> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/blocks`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear bloque");
  return res.json();
}

export async function updateBlock(
  token: string,
  blockId: string,
  data: { type?: string; content?: Record<string, unknown>; position?: number; containerId?: string | null }
): Promise<BlockApi> {
  const res = await fetch(`${getBaseUrl()}/blocks/${blockId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar bloque");
  return res.json();
}

export async function deleteBlock(token: string, blockId: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/blocks/${blockId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar bloque");
}

export async function reorderBlocks(
  token: string,
  pageId: string,
  blockIds: string[]
): Promise<BlockApi[]> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/blocks/reorder`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ blockIds }),
  });
  if (!res.ok) throw new Error("Error al reordenar");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
