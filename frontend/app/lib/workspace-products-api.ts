import { getBaseUrl, getAuthHeaders } from "./api";

export type ProductCategory =
  | "cleanser"
  | "moisturizer"
  | "sunscreen"
  | "serum"
  | "retinoid"
  | "exfoliant"
  | "toner"
  | "eye_care"
  | "spot_treatment"
  | "mask"
  | "oil"
  | "essence"
  | "balm";

export type ProductStatus = "active" | "testing" | "paused" | "finished" | "wishlist";

export type UsageTime = "am" | "pm" | "both";

export interface WorkspaceProductApi {
  id: string;
  workspaceId: string;
  name: string;
  brand: string | null;
  category: ProductCategory;
  textureFormat: string | null;
  mainIngredients: string[] | null;
  usageTime: UsageTime | null;
  status: ProductStatus;
  dateOpened: string | null;
  expirationDate: string | null;
  notes: string | null;
  rating: number | null;
  reactionNotes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceProductDto {
  name: string;
  brand?: string | null;
  category: ProductCategory;
  textureFormat?: string | null;
  mainIngredients?: string[] | null;
  usageTime?: UsageTime | null;
  status: ProductStatus;
  dateOpened?: string | null;
  expirationDate?: string | null;
  notes?: string | null;
  rating?: number | null;
  reactionNotes?: string | null;
  imageUrl?: string | null;
}

export interface UpdateWorkspaceProductDto {
  name?: string;
  brand?: string | null;
  category?: ProductCategory;
  textureFormat?: string | null;
  mainIngredients?: string[] | null;
  usageTime?: UsageTime | null;
  status?: ProductStatus;
  dateOpened?: string | null;
  expirationDate?: string | null;
  notes?: string | null;
  rating?: number | null;
  reactionNotes?: string | null;
  imageUrl?: string | null;
}

const base = (workspaceId: string) =>
  `${getBaseUrl()}/workspaces/${workspaceId}/products`;

export async function getWorkspaceProducts(
  token: string,
  workspaceId: string,
  params?: { status?: ProductStatus; category?: string }
): Promise<WorkspaceProductApi[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.category) search.set("category", params.category);
  const url = params?.status || params?.category ? `${base(workspaceId)}?${search}` : base(workspaceId);
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

export async function getWorkspaceProduct(
  token: string,
  workspaceId: string,
  productId: string
): Promise<WorkspaceProductApi> {
  const res = await fetch(`${base(workspaceId)}/${productId}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar producto");
  return res.json();
}

export async function createWorkspaceProduct(
  token: string,
  workspaceId: string,
  dto: CreateWorkspaceProductDto
): Promise<WorkspaceProductApi> {
  const res = await fetch(base(workspaceId), {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

export async function updateWorkspaceProduct(
  token: string,
  workspaceId: string,
  productId: string,
  dto: UpdateWorkspaceProductDto
): Promise<WorkspaceProductApi> {
  const res = await fetch(`${base(workspaceId)}/${productId}`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
}

export async function deleteWorkspaceProduct(
  token: string,
  workspaceId: string,
  productId: string
): Promise<void> {
  const res = await fetch(`${base(workspaceId)}/${productId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar producto");
}

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  cleanser: "Limpiador",
  moisturizer: "Hidratante",
  sunscreen: "Protector solar",
  serum: "Sérum",
  retinoid: "Retinoide",
  exfoliant: "Exfoliante",
  toner: "Tónico",
  eye_care: "Contorno de ojos",
  spot_treatment: "Tratamiento local",
  mask: "Mascarilla",
  oil: "Aceite",
  essence: "Esencia",
  balm: "Bálsamo",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "En uso",
  testing: "En prueba",
  paused: "Pausado",
  finished: "Terminado",
  wishlist: "Lista de deseos",
};

export const USAGE_TIME_LABELS: Record<UsageTime, string> = {
  am: "Mañana",
  pm: "Noche",
  both: "AM y PM",
};
