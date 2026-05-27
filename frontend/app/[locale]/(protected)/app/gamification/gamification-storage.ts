import type {
  GamificationExtras,
  Mission,
  TreasureReward,
} from "@/data/gamification";

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

export function patchGamificationExtras(
  userId: string,
  patch: Partial<GamificationExtras>,
): GamificationExtras | null {
  const current = loadGamificationExtras(userId);
  if (!current) return null;
  const next = { ...current, ...patch };
  saveGamificationExtras(userId, next);
  return next;
}

export function completeMission(
  userId: string,
  missionId: string,
): { extras: GamificationExtras; xpGained: number } | null {
  const extras = loadGamificationExtras(userId);
  if (!extras) return null;

  const missions = extras.misiones.map((m) => {
    if (m.id !== missionId) return m;
    if (m.reclamada || m.progreso < m.total) return m;
    return { ...m, completada: true, reclamada: true };
  });

  const mission = missions.find((m) => m.id === missionId);
  if (!mission?.reclamada) return null;

  const xpGained = mission.xp;
  const next: GamificationExtras = {
    ...extras,
    misiones: missions,
    multiplicadorActivo: extras.multiplicadorActivo,
  };
  saveGamificationExtras(userId, next);
  return { extras: next, xpGained };
}

export function useCycleShield(userId: string): boolean {
  const extras = loadGamificationExtras(userId);
  if (!extras || extras.escudos.disponibles <= 0) return false;
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
  const extras = loadGamificationExtras(userId);
  if (!extras) return null;

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
  const extras = loadGamificationExtras(userId);
  if (!extras) return null;

  const misiones: Mission[] = extras.misiones.map((m) => {
    if (m.id !== missionId || m.reclamada) return m;
    const progreso = Math.min(m.progreso + delta, m.total);
    return {
      ...m,
      progreso,
      completada: progreso >= m.total,
    };
  });

  const next = { ...extras, misiones };
  saveGamificationExtras(userId, next);
  return next;
}
