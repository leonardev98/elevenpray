"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createDefaultExtras,
  gamificationData,
  getTodayWeekIndex,
  type GamificationData,
  type GamificationExtras,
  type TreasureReward,
} from "@/data/gamification";
import { useAuth } from "@/app/providers/auth-provider";
import { hasCheckInToday, getStudentProfile } from "../lib/student-storage";
import {
  getActivitySummary,
  recordActivity,
  type ActivitySummaryDto,
  type ActivityType,
} from "@/app/lib/student-activity/api";
import {
  applyTreasureReward,
  completeMission,
  loadGamificationExtras,
  rollTreasureChest,
  saveGamificationExtras,
  useCycleShield,
} from "./gamification-storage";
import { syncReferralBadges } from "./lib/sync-badges";

type GamificationContextValue = {
  data: GamificationData;
  loading: boolean;
  streakJustCompleted: boolean;
  levelModalOpen: boolean;
  treasureReward: TreasureReward | null;
  recordActivity: (type: ActivityType) => Promise<void>;
  refreshSummary: () => Promise<void>;
  copyReferralCode: () => Promise<boolean>;
  claimMission: (missionId: string) => void;
  useShield: () => boolean;
  tryTreasureChest: () => void;
  dismissTreasure: () => void;
  simulateStudyStreakToday: () => void;
  simulateLevelUp: () => void;
  simulateReferral: () => void;
  clearStreakAnimation: () => void;
  closeLevelModal: () => void;
};

const GamificationContext = createContext<GamificationContextValue | null>(null);

function buildExtras(
  userId: string | undefined,
  profile: ReturnType<typeof getStudentProfile>,
): GamificationExtras {
  const stored = userId ? loadGamificationExtras(userId) : null;
  if (stored) return stored;
  return createDefaultExtras({
    userId,
    career: profile?.career,
    university: profile?.university,
    cycle: profile?.cycle,
    referralActivados: 0,
  });
}

function defaultData(userName?: string, userId?: string): GamificationData {
  const profile = getStudentProfile(userId ?? null);
  const base = JSON.parse(JSON.stringify(gamificationData)) as GamificationData;
  if (userName) {
    base.user.nombre = userName.split(" ")[0] ?? userName;
    base.user.avatarInicial = (userName.trim()[0] ?? "E").toUpperCase();
  }
  base.rachas.estudio.actual = 0;
  base.rachas.estudio.mejor = 0;
  base.rachas.estudio.hoy = false;
  base.rachas.estudio.semana = [false, false, false, false, false, false, false];
  base.rachas.tareas.actual = 0;
  base.rachas.tareas.mejor = 0;
  base.rachas.tareas.hoy = false;
  base.rachas.tareas.semana = [false, false, false, false, false, false, false];
  base.xpHoy = 0;
  base.xpTareasSemana = 0;
  base.extras = buildExtras(userId, profile);
  if (profile) {
    base.extras.liga.carrera = profile.career;
    base.extras.liga.universidad = profile.university;
    base.extras.escudos.cicloLabel = `Ciclo ${profile.cycle}`;
    base.ranking = base.ranking.map((e) => ({
      ...e,
      universidad: profile.university,
      carrera: profile.career,
    }));
  }
  return syncReferralBadges(base);
}

function persistExtras(userId: string, extras: GamificationExtras) {
  saveGamificationExtras(userId, extras);
}

function mergeSummary(prev: GamificationData, summary: ActivitySummaryDto): GamificationData {
  const todayIdx = getTodayWeekIndex();
  const actividades = prev.actividadesHoy.map((a) => {
    if (a.id === "checkin") return { ...a, completado: summary.checkinHoy };
    if (a.id === "tarea") return { ...a, completado: summary.rachas.tareas.hoy };
    return a;
  });
  const historialXP = [...prev.historialXP];
  if (historialXP.length > 0) {
    historialXP[historialXP.length - 1] = {
      ...historialXP[historialXP.length - 1],
      xp: summary.xpHoy,
    };
  }
  return {
    ...prev,
    rachas: {
      estudio: {
        actual: summary.rachas.estudio.actual,
        mejor: summary.rachas.estudio.mejor,
        hoy: summary.rachas.estudio.hoy,
        semana: summary.rachas.estudio.semana,
      },
      tareas: {
        actual: summary.rachas.tareas.actual,
        mejor: summary.rachas.tareas.mejor,
        hoy: summary.rachas.tareas.hoy,
        semana: summary.rachas.tareas.semana,
      },
    },
    xpHoy: summary.xpHoy,
    xpMetaDiaria: summary.xpMetaDiaria,
    xpTareasSemana: summary.xpTareasSemana,
    actividadesHoy: actividades,
    historialXP,
    historialSemanas: {
      estudio: prev.historialSemanas.estudio.map((row, i) =>
        i === 3 ? summary.rachas.estudio.semana : row,
      ),
      tareas: prev.historialSemanas.tareas.map((row, i) =>
        i === 3 ? summary.rachas.tareas.semana : row,
      ),
    },
  };
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [data, setData] = useState<GamificationData>(() =>
    defaultData(user?.name, user?.id),
  );
  const [loading, setLoading] = useState(true);
  const [streakJustCompleted, setStreakJustCompleted] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [treasureReward, setTreasureReward] = useState<TreasureReward | null>(null);
  const visitRecordedRef = useRef(false);

  const applyExtras = useCallback(
    (extras: GamificationExtras) => {
      setData((prev) => syncReferralBadges({ ...prev, extras }));
    },
    [],
  );

  const refreshSummary = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const summary = await getActivitySummary(token);
      setData((prev) => mergeSummary(prev, summary));
    } catch {
      // Sin backend: mantener estado local
    } finally {
      setLoading(false);
    }
  }, [token]);

  const recordActivityFn = useCallback(
    async (type: ActivityType) => {
      if (!token) return;
      const wasStudyDone = data.rachas.estudio.hoy;
      try {
        await recordActivity(token, type);
        const summary = await getActivitySummary(token);
        setData((prev) => mergeSummary(prev, summary));
        if (type === "study" || type === "checkin") {
          if (!wasStudyDone && summary.rachas.estudio.hoy) {
            setStreakJustCompleted(true);
          }
          if (Math.random() < 0.15) {
            const reward = rollTreasureChest();
            if (user?.id) {
              applyTreasureReward(user.id, reward);
              applyExtras(loadGamificationExtras(user.id) ?? data.extras);
            }
            if (reward.tipo === "xp") {
              setData((prev) => ({
                ...prev,
                user: {
                  ...prev.user,
                  xpActual: prev.user.xpActual + reward.valor,
                },
              }));
            }
            setTreasureReward(reward);
          }
        }
      } catch {
        // ignore
      }
    },
    [token, data.rachas.estudio.hoy, data.extras, user?.id, applyExtras],
  );

  const copyReferralCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.extras.referidos.codigo);
      return true;
    } catch {
      return false;
    }
  }, [data.extras.referidos.codigo]);

  const claimMission = useCallback(
    (missionId: string) => {
      if (!user?.id) return;
      const result = completeMission(user.id, missionId);
      if (!result) return;
      const loaded = loadGamificationExtras(user.id);
      if (loaded) applyExtras(loaded);
      setData((prev) => ({
        ...syncReferralBadges({ ...prev, extras: loaded ?? prev.extras }),
        user: {
          ...prev.user,
          xpActual: prev.user.xpActual + result.xpGained,
        },
      }));
    },
    [user?.id, applyExtras],
  );

  const useShield = useCallback(() => {
    if (!user?.id) return false;
    const ok = useCycleShield(user.id);
    if (ok) {
      const loaded = loadGamificationExtras(user.id);
      if (loaded) applyExtras(loaded);
    }
    return ok;
  }, [user?.id, applyExtras]);

  const tryTreasureChest = useCallback(() => {
    const reward = rollTreasureChest();
    if (user?.id) {
      applyTreasureReward(user.id, reward);
      const loaded = loadGamificationExtras(user.id);
      if (loaded) applyExtras(loaded);
    }
    if (reward.tipo === "xp") {
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, xpActual: prev.user.xpActual + reward.valor },
      }));
    }
    setTreasureReward(reward);
  }, [user?.id, applyExtras]);

  const dismissTreasure = useCallback(() => {
    setTreasureReward(null);
  }, []);

  const simulateReferral = useCallback(() => {
    if (!user?.id) return;
    const nextActivados = data.extras.referidos.activados + 1;
    const extras: GamificationExtras = {
      ...data.extras,
      referidos: {
        ...data.extras.referidos,
        activados: nextActivados,
        usosEstaSemana: data.extras.referidos.usosEstaSemana + 1,
        tiers: data.extras.referidos.tiers.map((t) => ({
          ...t,
          completado: nextActivados >= t.activados,
        })),
      },
    };
    persistExtras(user.id, extras);
    setData((prev) =>
      syncReferralBadges({
        ...prev,
        extras,
        user: { ...prev.user, xpActual: prev.user.xpActual + 500 },
      }),
    );
  }, [user?.id, data.extras]);

  useEffect(() => {
    if (user?.name || user?.id) {
      setData((prev) => {
        const next = defaultData(user?.name ?? prev.user.nombre, user?.id);
        return syncReferralBadges({
          ...prev,
          user: next.user,
          extras: next.extras,
          insignias: next.insignias,
        });
      });
    }
  }, [user?.name, user?.id]);

  useEffect(() => {
    void refreshSummary();
  }, [refreshSummary]);

  useEffect(() => {
    if (!token || visitRecordedRef.current) return;
    visitRecordedRef.current = true;
    void (async () => {
      if (hasCheckInToday(user?.id)) {
        await recordActivityFn("checkin");
      } else {
        await recordActivityFn("study");
      }
    })();
  }, [token, user?.id, recordActivityFn]);

  const simulateStudyStreakToday = useCallback(() => {
    void recordActivityFn("study");
  }, [recordActivityFn]);

  const simulateLevelUp = useCallback(() => {
    setData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        nivel: prev.user.nivel + 1,
        titulo: prev.tituloSiguienteNivel,
        xpActual: 0,
        xpSiguienteNivel: 4000,
      },
      tituloSiguienteNivel: "Maestro del estudio",
    }));
    setLevelModalOpen(true);
  }, []);

  const clearStreakAnimation = useCallback(() => {
    setStreakJustCompleted(false);
  }, []);

  const closeLevelModal = useCallback(() => {
    setLevelModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      data,
      loading,
      streakJustCompleted,
      levelModalOpen,
      treasureReward,
      recordActivity: recordActivityFn,
      refreshSummary,
      copyReferralCode,
      claimMission,
      useShield,
      tryTreasureChest,
      dismissTreasure,
      simulateStudyStreakToday,
      simulateLevelUp,
      simulateReferral,
      clearStreakAnimation,
      closeLevelModal,
    }),
    [
      data,
      loading,
      streakJustCompleted,
      levelModalOpen,
      treasureReward,
      recordActivityFn,
      refreshSummary,
      copyReferralCode,
      claimMission,
      useShield,
      tryTreasureChest,
      dismissTreasure,
      simulateStudyStreakToday,
      simulateLevelUp,
      simulateReferral,
      clearStreakAnimation,
      closeLevelModal,
    ],
  );

  return (
    <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>
  );
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamification must be used within GamificationProvider");
  }
  return ctx;
}
