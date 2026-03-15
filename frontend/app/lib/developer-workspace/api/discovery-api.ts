import { getBaseUrl, getAuthHeaders } from "@/app/lib/api";

export interface DiscoveryPromptItem {
  id: string;
  title: string;
  content: string;
  category?: string | null;
}

const BASE = () => getBaseUrl();

export type DiscoverySection = "prompts_of_the_day" | "trending";

export async function listDiscoveryPrompts(
  token: string,
  locale: string,
  section: DiscoverySection
): Promise<DiscoveryPromptItem[]> {
  const params = new URLSearchParams({ locale, section });
  const res = await fetch(`${BASE()}/discovery-prompts?${params}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error listing discovery prompts");
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((row: { id: string; title: string; content: string; category?: string | null }) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category ?? undefined,
      }))
    : [];
}
