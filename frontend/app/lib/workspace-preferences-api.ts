import { getBaseUrl, getAuthHeaders } from "./api";

export interface WorkspacePreferenceApi {
  id: string;
  userId: string;
  workspaceId: string;
  favorite: boolean;
  visibleOnDashboard: boolean;
  sortOrder: number;
  onboardingCompletedAt: string | null;
  onboardingAnswers: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWorkspacePreferenceDto {
  favorite?: boolean;
  visibleOnDashboard?: boolean;
  sortOrder?: number;
  completeOnboarding?: boolean;
  onboardingAnswers?: Record<string, unknown> | null;
}

const BASE = () => `${getBaseUrl()}/workspace-preferences`;

export async function getWorkspacePreference(
  token: string,
  workspaceId: string
): Promise<WorkspacePreferenceApi | null> {
  const res = await fetch(`${BASE()}/workspaces/${workspaceId}`, {
    headers: getAuthHeaders(token),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error al cargar preferencias");
  return res.json();
}

export async function getPreferences(token: string): Promise<WorkspacePreferenceApi[]> {
  const res = await fetch(BASE(), { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar preferencias");
  return res.json();
}

export async function updateWorkspacePreference(
  token: string,
  workspaceId: string,
  dto: UpdateWorkspacePreferenceDto
): Promise<WorkspacePreferenceApi> {
  const res = await fetch(`${BASE()}/workspaces/${workspaceId}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar preferencias");
  return res.json();
}
