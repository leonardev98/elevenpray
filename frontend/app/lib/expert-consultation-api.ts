import { getBaseUrl, getAuthHeaders } from "./api";

export interface ExpertConsultationSpecialtyApi {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
}

export interface ExpertConsultationExpertApi {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specialties?: Array<{ specialty?: ExpertConsultationSpecialtyApi }>;
}

export interface ExpertConsultationMessageApi {
  id: string;
  sessionId: string;
  senderType: "user" | "expert";
  body: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export interface ExpertConsultationSessionApi {
  id: string;
  userId: string;
  workspaceId: string;
  expertId: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  expert?: ExpertConsultationExpertApi;
  messages?: ExpertConsultationMessageApi[];
}

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}`;

export async function getExperts(
  token: string,
  workspaceId: string
): Promise<ExpertConsultationExpertApi[]> {
  const res = await fetch(`${base(workspaceId)}/experts`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar expertos");
  return res.json();
}

export async function getExpert(
  token: string,
  workspaceId: string,
  expertId: string
): Promise<ExpertConsultationExpertApi> {
  const res = await fetch(`${base(workspaceId)}/experts/${expertId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar experto");
  return res.json();
}

export async function getExpertSessions(
  token: string,
  workspaceId: string
): Promise<ExpertConsultationSessionApi[]> {
  const res = await fetch(`${base(workspaceId)}/expert-sessions`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar sesiones");
  return res.json();
}

export async function getExpertSession(
  token: string,
  workspaceId: string,
  sessionId: string
): Promise<ExpertConsultationSessionApi> {
  const res = await fetch(`${base(workspaceId)}/expert-sessions/${sessionId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar sesión");
  return res.json();
}
