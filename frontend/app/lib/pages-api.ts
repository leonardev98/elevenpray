import { getBaseUrl, getAuthHeaders } from "./api";

export interface PageApi {
  id: string;
  workspaceId: string;
  spaceId: string | null;
  parentPageId: string | null;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export async function getRootPages(
  token: string,
  workspaceId: string
): Promise<PageApi[]> {
  const res = await fetch(
    `${getBaseUrl()}/workspaces/${workspaceId}/pages`,
    { headers: getAuthHeaders(token) }
  );
  if (!res.ok) throw new Error("Error al cargar páginas");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getPage(
  token: string,
  pageId: string
): Promise<PageApi> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar página");
  return res.json();
}

export async function getPageChildren(
  token: string,
  pageId: string
): Promise<PageApi[]> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}/children`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar subpáginas");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createPage(
  token: string,
  workspaceId: string,
  data: { title: string; spaceId?: string | null; parentPageId?: string | null; position?: number }
): Promise<PageApi> {
  const res = await fetch(
    `${getBaseUrl()}/workspaces/${workspaceId}/pages`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Error al crear página");
  return res.json();
}

export async function createPageChild(
  token: string,
  parentPageId: string,
  data: { title: string; position?: number }
): Promise<PageApi> {
  const res = await fetch(
    `${getBaseUrl()}/pages/${parentPageId}/children`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Error al crear subpágina");
  return res.json();
}

export async function updatePage(
  token: string,
  pageId: string,
  data: { title?: string; spaceId?: string | null; position?: number }
): Promise<PageApi> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar página");
  return res.json();
}

export async function deletePage(
  token: string,
  pageId: string
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/pages/${pageId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar página");
}
