import { getBaseUrl, getAuthHeaders } from "./api";

export type PhotoAngle = "front" | "left" | "right";

export interface WorkspacePhotoApi {
  id: string;
  workspaceId: string;
  photoDate: string;
  angle: PhotoAngle;
  notes: string | null;
  concernTags: string[] | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspacePhotoDto {
  photoDate: string;
  angle: PhotoAngle;
  notes?: string | null;
  concernTags?: string[] | null;
  imageUrl: string;
}

export interface UpdateWorkspacePhotoDto {
  photoDate?: string;
  angle?: PhotoAngle;
  notes?: string | null;
  concernTags?: string[] | null;
  imageUrl?: string;
}

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}/photos`;

export async function getWorkspacePhotos(
  token: string,
  workspaceId: string,
  params?: { from?: string; to?: string }
): Promise<WorkspacePhotoApi[]> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const url = params?.from || params?.to ? `${base(workspaceId)}?${search}` : base(workspaceId);
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar fotos");
  return res.json();
}

export async function getWorkspacePhoto(
  token: string,
  workspaceId: string,
  photoId: string
): Promise<WorkspacePhotoApi> {
  const res = await fetch(`${base(workspaceId)}/${photoId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar foto");
  return res.json();
}

export async function createWorkspacePhoto(
  token: string,
  workspaceId: string,
  dto: CreateWorkspacePhotoDto
): Promise<WorkspacePhotoApi> {
  const res = await fetch(base(workspaceId), {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear foto");
  return res.json();
}

export async function updateWorkspacePhoto(
  token: string,
  workspaceId: string,
  photoId: string,
  dto: UpdateWorkspacePhotoDto
): Promise<WorkspacePhotoApi> {
  const res = await fetch(`${base(workspaceId)}/${photoId}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar foto");
  return res.json();
}

export async function deleteWorkspacePhoto(
  token: string,
  workspaceId: string,
  photoId: string
): Promise<void> {
  const res = await fetch(`${base(workspaceId)}/${photoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar foto");
}

export const PHOTO_ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: "Frontal",
  left: "Izquierda",
  right: "Derecha",
};
