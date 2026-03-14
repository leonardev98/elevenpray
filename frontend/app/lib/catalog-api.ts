import { getBaseUrl, getAuthHeaders } from "./api";

export interface CatalogProductApi {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  benefits: string[] | null;
  ingredients: string[] | null;
  concernTags: string[] | null;
  skinTypeCompatibility: string[] | null;
  usageInstructions: string | null;
  experienceLevel: string | null;
  rating: number | null;
  warnings: string | null;
  routinePosition: string | null;
  imageUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}/catalog`;

export async function getCatalogProducts(
  token: string,
  workspaceId: string,
  params?: { category?: string; concern?: string; search?: string; locale?: string }
): Promise<CatalogProductApi[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.concern) search.set("concern", params.concern);
  if (params?.search) search.set("search", params.search);
  if (params?.locale) search.set("locale", params.locale);
  const url = search.toString() ? `${base(workspaceId)}/products?${search}` : `${base(workspaceId)}/products`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar catálogo");
  return res.json();
}

export async function getCatalogProduct(
  token: string,
  workspaceId: string,
  productId: string,
  locale?: string
): Promise<CatalogProductApi> {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : "";
  const res = await fetch(`${base(workspaceId)}/products/${productId}${query}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar producto");
  return res.json();
}

export async function getCatalogBookmarks(
  token: string,
  workspaceId: string
): Promise<string[]> {
  const res = await fetch(`${base(workspaceId)}/bookmarks`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar favoritos");
  return res.json();
}

export async function addCatalogBookmark(
  token: string,
  workspaceId: string,
  catalogProductId: string
): Promise<unknown> {
  const res = await fetch(`${base(workspaceId)}/bookmarks`, {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ catalogProductId }),
  });
  if (!res.ok) throw new Error("Error al guardar favorito");
  return res.json();
}

export async function removeCatalogBookmark(
  token: string,
  workspaceId: string,
  catalogProductId: string
): Promise<void> {
  const res = await fetch(`${base(workspaceId)}/bookmarks/${catalogProductId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al quitar favorito");
}
