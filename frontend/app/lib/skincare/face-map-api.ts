import { getBaseUrl, getAuthHeaders } from "../api";
import type {
  FaceSessionApi,
  FaceMarkerApi,
  CreateSessionDto,
  CreateMarkerDto,
  UpdateMarkerDto,
} from "./face-map/face-map.types";

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}/face`;

export async function getFaceSessions(
  token: string,
  workspaceId: string,
  params?: { from?: string; to?: string }
): Promise<FaceSessionApi[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const url =
    params?.from || params?.to
      ? `${base(workspaceId)}/sessions?${search}`
      : `${base(workspaceId)}/sessions`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar sesiones");
  return res.json();
}

export async function createFaceSession(
  token: string,
  workspaceId: string,
  dto: CreateSessionDto
): Promise<FaceSessionApi> {
  const res = await fetch(`${base(workspaceId)}/sessions`, {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear sesión");
  return res.json();
}

export async function getFaceMarkers(
  token: string,
  workspaceId: string,
  params?: {
    sessionId?: string;
    from?: string;
    to?: string;
    faceModelType?: "female" | "male";
  }
): Promise<FaceMarkerApi[]> {
  const search = new URLSearchParams();
  if (params?.sessionId) search.set("sessionId", params.sessionId);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.faceModelType) search.set("faceModelType", params.faceModelType);
  const query = search.toString();
  const url = query ? `${base(workspaceId)}/markers?${query}` : `${base(workspaceId)}/markers`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar marcadores");
  return res.json();
}

export async function getFaceMarker(
  token: string,
  workspaceId: string,
  markerId: string
): Promise<FaceMarkerApi> {
  const res = await fetch(`${base(workspaceId)}/markers/${markerId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar marcador");
  return res.json();
}

export async function createFaceMarker(
  token: string,
  workspaceId: string,
  dto: CreateMarkerDto
): Promise<FaceMarkerApi> {
  const res = await fetch(`${base(workspaceId)}/markers`, {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear marcador");
  return res.json();
}

export async function updateFaceMarker(
  token: string,
  workspaceId: string,
  markerId: string,
  dto: UpdateMarkerDto
): Promise<FaceMarkerApi> {
  const res = await fetch(`${base(workspaceId)}/markers/${markerId}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar marcador");
  return res.json();
}

export async function deleteFaceMarker(
  token: string,
  workspaceId: string,
  markerId: string
): Promise<void> {
  const res = await fetch(`${base(workspaceId)}/markers/${markerId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar marcador");
}
