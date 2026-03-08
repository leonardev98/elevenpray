import { getBaseUrl, getAuthHeaders } from "./api";

export interface WorkspaceSubtypeApi {
  id: string;
  code: string;
  label: string;
  defaultPages: { title: string; position: number }[] | null;
  sortOrder: number;
}

export async function getWorkspaceSubtypesByType(
  token: string,
  workspaceTypeCode: string
): Promise<WorkspaceSubtypeApi[]> {
  const url = `${getBaseUrl()}/workspace-subtypes?workspaceTypeCode=${encodeURIComponent(workspaceTypeCode)}`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
