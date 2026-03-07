import { getBaseUrl, getAuthHeaders } from "./api";

export type BlockType = "heading" | "list" | "text";

export interface Block {
  type: BlockType;
  content: string;
}

export interface DayContent {
  blocks: Block[];
}

export interface Routine {
  id: string;
  userId: string;
  weekLabel: string;
  year: number;
  weekNumber: number;
  days: Record<string, DayContent>;
}

export interface CreateRoutineDto {
  weekLabel: string;
  year: number;
  weekNumber: number;
  days: Record<string, DayContent>;
}

export interface UpdateRoutineDto {
  weekLabel?: string;
  year?: number;
  weekNumber?: number;
  days?: Record<string, DayContent>;
}

export async function getRoutines(token: string): Promise<Routine[]> {
  const res = await fetch(`${getBaseUrl()}/routines`, {
    headers: getAuthHeaders(token),
  });
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
