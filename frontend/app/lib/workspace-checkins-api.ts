import { getBaseUrl, getAuthHeaders } from "./api";

export interface CheckinData {
  skinFeeling?: string;
  dryness?: number;
  oiliness?: number;
  redness?: number;
  sensitivity?: number;
  breakouts?: number;
  itchiness?: number;
  confidenceNote?: string;
  sleepQuality?: number;
  stress?: number;
  cycleNote?: string;
  weatherNote?: string;
  freeNotes?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface WorkspaceCheckinApi {
  id: string;
  workspaceId: string;
  checkinDate: string;
  data: CheckinData | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceCheckinDto {
  checkinDate: string;
  data?: CheckinData | null;
}

export interface UpdateWorkspaceCheckinDto {
  checkinDate?: string;
  data?: CheckinData | null;
}

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}/checkins`;

export async function getWorkspaceCheckins(
  token: string,
  workspaceId: string,
  params?: { from?: string; to?: string }
): Promise<WorkspaceCheckinApi[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const url = params?.from || params?.to ? `${base(workspaceId)}?${search}` : base(workspaceId);
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar check-ins");
  return res.json();
}

export async function getWorkspaceCheckin(
  token: string,
  workspaceId: string,
  checkinId: string
): Promise<WorkspaceCheckinApi> {
  const res = await fetch(`${base(workspaceId)}/${checkinId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar check-in");
  return res.json();
}

export async function createWorkspaceCheckin(
  token: string,
  workspaceId: string,
  dto: CreateWorkspaceCheckinDto
): Promise<WorkspaceCheckinApi> {
  const res = await fetch(base(workspaceId), {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear check-in");
  return res.json();
}

export async function updateWorkspaceCheckin(
  token: string,
  workspaceId: string,
  checkinId: string,
  dto: UpdateWorkspaceCheckinDto
): Promise<WorkspaceCheckinApi> {
  const res = await fetch(`${base(workspaceId)}/${checkinId}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar check-in");
  return res.json();
}

export async function deleteWorkspaceCheckin(
  token: string,
  workspaceId: string,
  checkinId: string
): Promise<void> {
  const res = await fetch(`${base(workspaceId)}/${checkinId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar check-in");
}
