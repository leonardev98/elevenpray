import type {
  GamificationExtras,
  TreasureReward,
} from "@/data/gamification";
import { createDefaultExtras } from "@/data/gamification";
import {
  buildMissions,
  bumpMissionInList,
  completeMissionInList,
  hasLegacyMissions,
  missionsToStoredState,
} from "@/data/gamification-missions";

const PREFIX = "mitsyy_gamification_extras_";

export function loadGamificationExtras(userId: string): GamificationExtras | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as GamificationExtras;
  } catch {
    return null;
  }
}

export function saveGamificationExtras(userId: string, extras: GamificationExtras): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(extras));
}

function normalizeExtrasMissions(extras: GamificationExtras): GamificationExtras {
  if (hasLegacyMissions(extras.misiones)) {
    return { ...extras, misiones: buildMissions() };
  }
  const stored = missionsToStoredState(extras.misiones);
  return { ...extras, misiones: buildMissions(stored) };
}

export function ensureGamificationExtras(
  userId: string,
  opts?: Parameters<typeof createDefaultExtras>[0],
): GamificationExtras {
  const existing = loadGamificationExtras(userId);
  const base = existing ?? createDefaultExtras(opts);
  const normalized = normalizeExtrasMissions(base);
  saveGamificationExtras(userId, normalized);
  return normalized;
}

export function patchGamificationExtras(
  userId: string,
  patch: Partial<GamificationExtras>,
): GamificationExtras | null {
  const current = ensureGamificationExtras(userId);
  const next = normalizeExtrasMissions({ ...current, ...patch });
  saveGamificationExtras(userId, next);
  return next;
}

export function completeMission(
  userId: string,
  missionId: string,
): { extras: GamificationExtras; xpGained: number } | null {
  const extras = ensureGamificationExtras(userId);
  const result = completeMissionInList(extras.misiones, missionId);
  if (!result) return null;

  const next: GamificationExtras = {
    ...extras,
    misiones: result.missions,
  };
  saveGamificationExtras(userId, next);
  return { extras: next, xpGained: result.xpGained };
}

export function useCycleShield(userId: string): boolean {
  const extras = ensureGamificationExtras(userId);
  if (extras.escudos.disponibles <= 0) return false;
  const next: GamificationExtras = {
    ...extras,
    escudos: {
      ...extras.escudos,
      disponibles: extras.escudos.disponibles - 1,
      usadosEsteCiclo: extras.escudos.usadosEsteCiclo + 1,
    },
  };
  saveGamificationExtras(userId, next);
  return true;
}

const TREASURE_POOL: Omit<TreasureReward, "id">[] = [
  { tipo: "xp", label: "+75 XP extra", valor: 75 },
  { tipo: "escudo", label: "1 escudo de ciclo", valor: 1 },
  { tipo: "multiplicador", label: "Boost ×1.5 XP por 24h", valor: 1.5 },
];

export function rollTreasureChest(): TreasureReward {
  const roll = Math.random();
  const pick =
    roll < 0.5
      ? TREASURE_POOL[0]
      : roll < 0.8
        ? TREASURE_POOL[1]
        : TREASURE_POOL[2];
  return {
    id: `treasure-${Date.now()}`,
    ...pick,
  };
}

export function applyTreasureReward(
  userId: string,
  reward: TreasureReward,
): GamificationExtras | null {
  const extras = ensureGamificationExtras(userId);

  let next = { ...extras, ultimoCofre: reward };

  if (reward.tipo === "escudo") {
    next = {
      ...next,
      escudos: {
        ...next.escudos,
        disponibles: Math.min(
          next.escudos.disponibles + reward.valor,
          next.escudos.maxPorCiclo,
        ),
      },
    };
  }
  if (reward.tipo === "multiplicador") {
    const until = new Date();
    until.setHours(until.getHours() + 24);
    next = {
      ...next,
      multiplicadorActivo: {
        activo: true,
        factor: reward.valor,
        hasta: until.toISOString(),
      },
    };
  }

  saveGamificationExtras(userId, next);
  return next;
}

export function bumpMissionProgress(
  userId: string,
  missionId: string,
  delta = 1,
): GamificationExtras | null {
  const extras = ensureGamificationExtras(userId);
  const misiones = bumpMissionInList(extras.misiones, missionId, delta);
  const next = { ...extras, misiones };
  saveGamificationExtras(userId, next);
  return next;
}

export function setMissions(
  userId: string,
  misiones: GamificationExtras["misiones"],
): GamificationExtras {
  const extras = ensureGamificationExtras(userId);
  const next = { ...extras, misiones };
  saveGamificationExtras(userId, next);
  return next;
}
