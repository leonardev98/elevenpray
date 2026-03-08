import { getBaseUrl, getAuthHeaders } from "./api";

export interface TopicEntryApi {
  id: string;
  topicId: string;
  userId: string;
  entryDate: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getTopicEntries(
  token: string,
  topicId: string,
  from: string,
  to: string
): Promise<TopicEntryApi[]> {
  const url = `${getBaseUrl()}/topics/${topicId}/entries?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar entradas");
  return res.json();
}

export async function createTopicEntry(
  token: string,
  topicId: string,
  data: { entryDate: string; content?: string; imageUrl?: string }
): Promise<TopicEntryApi> {
  const res = await fetch(`${getBaseUrl()}/topics/${topicId}/entries`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear entrada");
  return res.json();
}

export async function updateTopicEntry(
  token: string,
  id: string,
  data: { entryDate?: string; content?: string; imageUrl?: string }
): Promise<TopicEntryApi> {
  const res = await fetch(`${getBaseUrl()}/topics/entries/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar entrada");
  return res.json();
}

export async function deleteTopicEntry(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/topics/entries/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar entrada");
}
