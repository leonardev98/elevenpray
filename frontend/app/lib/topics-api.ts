import { getBaseUrl, getAuthHeaders } from "./api";

export interface TopicApi {
  id: string;
  title: string;
  type: string;
  sortOrder?: number;
  createdAt: string;
}

const TOPICS_URL = () => `${getBaseUrl()}/topics`;

export async function getTopics(token: string): Promise<TopicApi[]> {
  const res = await fetch(TOPICS_URL(), { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar tópicos");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createTopic(
  token: string,
  title: string,
  type: string
): Promise<TopicApi> {
  const res = await fetch(TOPICS_URL(), {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title: title.trim() || "Sin título", type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Error al crear tópico");
  }
  return res.json();
}

export async function updateTopic(
  token: string,
  id: string,
  data: { title?: string; sortOrder?: number }
): Promise<TopicApi> {
  const res = await fetch(`${TOPICS_URL()}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar tópico");
  return res.json();
}

export async function deleteTopic(token: string, id: string): Promise<void> {
  const res = await fetch(`${TOPICS_URL()}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar tópico");
}
