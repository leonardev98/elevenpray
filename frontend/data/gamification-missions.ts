import type { Mission } from "@/data/gamification";
import { MISSION_DEFINITIONS } from "@/data/gamification-config";

export type MissionBackendSync = {
  quizSemana: number;
  comunidadUtilSemana: number;
};

export type StoredMissionState = {
  periodKey: string;
  progreso: number;
  reclamada: boolean;
};

const LEGACY_MISSION_IDS = new Set([
  "flashcards-calc",
  "quiz-jueves",
  "ayuda-comunidad",
]);

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function missionPeriodKey(tipo: "diaria" | "semanal", date = new Date()): string {
  if (tipo === "diaria") {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  const d = new Date(date);
  const jsDay = d.getDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function missionFromDefinition(
  def: (typeof MISSION_DEFINITIONS)[number],
  stored?: StoredMissionState,
): Mission {
  const periodKey = missionPeriodKey(def.tipo);
  const validStored = stored?.periodKey === periodKey ? stored : undefined;
  const progreso = Math.min(validStored?.progreso ?? 0, def.total);
  const reclamada = validStored?.reclamada ?? false;
  return {
    id: def.id,
    titulo: def.titulo,
    descripcion: def.descripcion,
    xp: def.xp,
    total: def.total,
    tipo: def.tipo,
    progreso,
    completada: progreso >= def.total,
    reclamada,
  };
}

export function buildMissions(stored?: Record<string, StoredMissionState>): Mission[] {
  return MISSION_DEFINITIONS.map((def) => missionFromDefinition(def, stored?.[def.id]));
}

export function missionsToStoredState(missions: Mission[]): Record<string, StoredMissionState> {
  const out: Record<string, StoredMissionState> = {};
  for (const m of missions) {
    out[m.id] = {
      periodKey: missionPeriodKey(m.tipo),
      progreso: m.progreso,
      reclamada: m.reclamada,
    };
  }
  return out;
}

export function hasLegacyMissions(missions: Mission[] | undefined): boolean {
  if (!missions?.length) return false;
  return missions.some((m) => LEGACY_MISSION_IDS.has(m.id));
}

export function syncMissionsFromBackend(
  missions: Mission[],
  sync?: MissionBackendSync | null,
): Mission[] {
  if (!sync) return missions;
  return missions.map((m) => {
    if (m.reclamada) return m;
    let backendProgress = 0;
    if (m.id === "quiz-semanal") backendProgress = sync.quizSemana > 0 ? 1 : 0;
    if (m.id === "comunidad-semanal") {
      backendProgress = sync.comunidadUtilSemana > 0 ? 1 : 0;
    }
    if (backendProgress <= m.progreso) return m;
    const progreso = Math.min(backendProgress, m.total);
    return {
      ...m,
      progreso,
      completada: progreso >= m.total,
    };
  });
}

export function bumpMissionInList(
  missions: Mission[],
  missionId: string,
  delta = 1,
): Mission[] {
  return missions.map((m) => {
    if (m.id !== missionId || m.reclamada) return m;
    const progreso = Math.min(m.progreso + delta, m.total);
    return {
      ...m,
      progreso,
      completada: progreso >= m.total,
    };
  });
}

export function completeMissionInList(
  missions: Mission[],
  missionId: string,
): { missions: Mission[]; xpGained: number } | null {
  let xpGained = 0;
  const next = missions.map((m) => {
    if (m.id !== missionId) return m;
    if (m.reclamada || m.progreso < m.total) return m;
    xpGained = m.xp;
    return { ...m, completada: true, reclamada: true };
  });
  if (xpGained <= 0) return null;
  return { missions: next, xpGained };
}
