import { getBaseUrl, getAuthHeaders } from "./api";

export type BlockType = "heading" | "list" | "text";

export interface Block {
  type: BlockType;
  content: string;
}

export interface DayItem {
  id: string;
  type: BlockType;
  content: string;
  productId?: string;
  stepType?: string;
}

export type RoutineSlot = "am" | "pm";
export type SkinType = "oily" | "dry" | "combination" | "sensitive" | "acne-prone";
export type RoutineComplexity = "minimal" | "balanced" | "advanced";
export type WeeklyIntent = "recovery" | "retinoid" | "exfoliation" | "hydration" | "rest";

export interface RoutineMetadata {
  skinType?: SkinType;
  goals?: string[];
  complexity?: RoutineComplexity;
  weeklyIntents?: Partial<Record<string, WeeklyIntent>>;
}

export interface DayGroup {
  id: string;
  title: string;
  time?: string;
  slot?: RoutineSlot;
  items: DayItem[];
}

export interface DayContent {
  blocks?: Block[];
  items?: DayItem[];
  groups?: DayGroup[];
}

export interface Routine {
  id: string;
  userId: string;
  topicId?: string | null;
  workspaceId?: string | null;
  weekLabel: string;
  year: number;
  weekNumber: number;
  days: Record<string, DayContent>;
  metadata?: RoutineMetadata | null;
}

export async function getRoutinesByTopic(token: string, topicId: string): Promise<Routine[]> {
  const res = await fetch(`${getBaseUrl()}/routines?topicId=${encodeURIComponent(topicId)}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar rutinas del tópico");
  return res.json();
}

export interface CreateRoutineDto {
  weekLabel: string;
  year: number;
  weekNumber: number;
  days: Record<string, DayContent>;
  metadata?: RoutineMetadata | null;
}

export interface UpdateRoutineDto {
  weekLabel?: string;
  year?: number;
  weekNumber?: number;
  days?: Record<string, DayContent>;
  metadata?: RoutineMetadata | null;
}

export async function getRoutines(token: string, topicId?: string): Promise<Routine[]> {
  const url = topicId ? `${getBaseUrl()}/routines?topicId=${encodeURIComponent(topicId)}` : `${getBaseUrl()}/routines`;
  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) throw new Error("Error al cargar rutinas");
  return res.json();
}

export async function getRoutine(
  token: string,
  id: string,
): Promise<Routine> {
  const res = await fetch(`${getBaseUrl()}/routines/${id}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al cargar rutina");
  return res.json();
}

export async function createRoutine(
  token: string,
  dto: CreateRoutineDto,
): Promise<Routine> {
  const res = await fetch(`${getBaseUrl()}/routines`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al crear rutina");
  return res.json();
}

export async function updateRoutine(
  token: string,
  id: string,
  dto: UpdateRoutineDto,
): Promise<Routine> {
  const res = await fetch(`${getBaseUrl()}/routines/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Error al actualizar rutina");
  return res.json();
}

export async function deleteRoutine(
  token: string,
  id: string,
): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/routines/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar rutina");
}
