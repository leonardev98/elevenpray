import { getBaseUrl, getAuthHeaders } from "@/app/lib/api";
import type {
  PromptApi,
  PromptFolderApi,
  PromptCategoryApi,
  DeveloperProjectApi,
  PromptTagApi,
} from "../types";

const BASE = () => getBaseUrl();

export interface ListPromptsParams {
  folderId?: string;
  categoryId?: string;
  projectId?: string;
  isFavorite?: boolean;
  status?: string;
  search?: string;
  sortBy?: "updated_at" | "last_used_at" | "created_at" | "title";
  sortOrder?: "asc" | "desc";
  recent?: boolean;
}

function buildSearchParams(params: ListPromptsParams): string {
  const sp = new URLSearchParams();
  if (params.folderId) sp.set("folderId", params.folderId);
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.projectId) sp.set("projectId", params.projectId);
  if (params.isFavorite !== undefined) sp.set("isFavorite", String(params.isFavorite));
  if (params.status) sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);
  if (params.sortBy) sp.set("sortBy", params.sortBy);
  if (params.sortOrder) sp.set("sortOrder", params.sortOrder);
  if (params.recent !== undefined) sp.set("recent", String(params.recent));
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function listPrompts(
  token: string,
  params: ListPromptsParams = {}
): Promise<PromptApi[]> {
  const res = await fetch(
    `${BASE()}/prompts${buildSearchParams(params)}`,
    { headers: getAuthHeaders(token) }
  );
  if (!res.ok) throw new Error("Error listing prompts");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getPrompt(
  token: string,
  id: string
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Prompt not found");
    throw new Error("Error loading prompt");
  }
  return res.json();
}

export interface CreatePromptBody {
  title: string;
  slug?: string;
  description?: string;
  content: string;
  promptType?: string;
  status?: "active" | "archived" | "draft";
  folderId?: string;
  categoryId?: string;
  projectId?: string;
  repositoryName?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  tagIds?: string[];
  tagNames?: string[];
}

export async function createPrompt(
  token: string,
  body: CreatePromptBody
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error creating prompt");
  return res.json();
}

export type UpdatePromptBody = Partial<Omit<CreatePromptBody, "folderId" | "categoryId" | "projectId" | "repositoryName">> & {
  folderId?: string | null;
  categoryId?: string | null;
  projectId?: string | null;
  repositoryName?: string | null;
};

export async function updatePrompt(
  token: string,
  id: string,
  body: UpdatePromptBody
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error updating prompt");
  return res.json();
}

export async function deletePrompt(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${BASE()}/prompts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error deleting prompt");
}

export async function duplicatePrompt(
  token: string,
  id: string
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/duplicate`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error duplicating prompt");
  return res.json();
}

export async function setPromptFavorite(
  token: string,
  id: string,
  value: boolean
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/favorite`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Error updating favorite");
  return res.json();
}

export async function setPromptPinned(
  token: string,
  id: string,
  value: boolean
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/pin`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error("Error updating pin");
  return res.json();
}

export async function archivePrompt(
  token: string,
  id: string
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/archive`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error archiving prompt");
  return res.json();
}

export async function unarchivePrompt(
  token: string,
  id: string
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/unarchive`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error unarchiving prompt");
  return res.json();
}

export async function recordPromptUse(
  token: string,
  id: string
): Promise<PromptApi> {
  const res = await fetch(`${BASE()}/prompts/${id}/use`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error recording use");
  return res.json();
}

// Folders
export async function listPromptFolders(
  token: string
): Promise<PromptFolderApi[]> {
  const res = await fetch(`${BASE()}/prompt-folders`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error listing folders");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createPromptFolder(
  token: string,
  body: { name: string; sortOrder?: number }
): Promise<PromptFolderApi> {
  const res = await fetch(`${BASE()}/prompt-folders`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error creating folder");
  return res.json();
}

export async function updatePromptFolder(
  token: string,
  id: string,
  body: { name?: string; sortOrder?: number }
): Promise<PromptFolderApi> {
  const res = await fetch(`${BASE()}/prompt-folders/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error updating folder");
  return res.json();
}

export async function deletePromptFolder(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${BASE()}/prompt-folders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error deleting folder");
}

// Categories
export async function listPromptCategories(
  token: string
): Promise<PromptCategoryApi[]> {
  const res = await fetch(`${BASE()}/prompt-categories`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error listing categories");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Projects
export async function listDeveloperProjects(
  token: string
): Promise<DeveloperProjectApi[]> {
  const res = await fetch(`${BASE()}/developer-projects`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error listing projects");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createDeveloperProject(
  token: string,
  body: { name: string; repositoryName?: string; sortOrder?: number }
): Promise<DeveloperProjectApi> {
  const res = await fetch(`${BASE()}/developer-projects`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error creating project");
  return res.json();
}

export async function updateDeveloperProject(
  token: string,
  id: string,
  body: { name?: string; repositoryName?: string; sortOrder?: number }
): Promise<DeveloperProjectApi> {
  const res = await fetch(`${BASE()}/developer-projects/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error updating project");
  return res.json();
}

export async function deleteDeveloperProject(
  token: string,
  id: string
): Promise<void> {
  const res = await fetch(`${BASE()}/developer-projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error deleting project");
}

// Tags
export async function listPromptTags(
  token: string,
  search?: string
): Promise<PromptTagApi[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${BASE()}/prompt-tags${q}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error listing tags");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createPromptTag(
  token: string,
  body: { name: string }
): Promise<PromptTagApi> {
  const res = await fetch(`${BASE()}/prompt-tags`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Error creating tag");
  return res.json();
}
