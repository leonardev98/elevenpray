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
  type GamificationData,
  type GamificationExtras,
  type TreasureReward,
} from "@/data/gamification";
import { useAuth } from "@/app/providers/auth-provider";
import { hasCheckInToday, getStudentProfile } from "../lib/student-storage";
import {
  getActivitySummary,
  recordActivity,
  recordBonusXp,
  type ActivitySummaryDto,
  type ActivityType,
} from "@/app/lib/student-activity/api";
import {
  applyReferralCode as applyReferralCodeApi,
  getReferralSummary,
  type ReferralSummaryDto,
} from "@/app/lib/referrals/api";
import { REFERRAL_MILESTONES } from "@/data/gamification-config";
import { computeLevelProgress } from "@/data/gamification-level";
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
  applyReferralCode: (code: string) => Promise<void>;
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
  const level = computeLevelProgress(0);

  if (userName) {
    base.user.nombre = userName.split(" ")[0] ?? userName;
    base.user.avatarInicial = (userName.trim()[0] ?? "E").toUpperCase();
  }
  base.user.nivel = level.nivel;
  base.user.titulo = level.titulo;
  base.user.xpActual = level.xpActual;
  base.user.xpSiguienteNivel = level.xpSiguienteNivel;
  base.tituloSiguienteNivel = level.tituloSiguienteNivel;

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
  base.historialXP = [
    { dia: "Lun", xp: 0 },
    { dia: "Mar", xp: 0 },
    { dia: "Mié", xp: 0 },
    { dia: "Jue", xp: 0 },
    { dia: "Vie", xp: 0 },
    { dia: "Sáb", xp: 0 },
    { dia: "Hoy", xp: 0 },
  ];
  base.historialSemanas = {
    estudio: Array.from({ length: 4 }, () => [false, false, false, false, false, false, false]),
    tareas: Array.from({ length: 4 }, () => [false, false, false, false, false, false, false]),
  };
  base.ranking = [];
  base.comparacionSemana = { porcentaje: 0 };
  base.extras = buildExtras(userId, profile);
  if (profile) {
    base.extras.liga.carrera = profile.career;
    base.extras.liga.universidad = profile.university;
    base.extras.escudos.cicloLabel = `Ciclo ${profile.cycle}`;
  }
  return syncReferralBadges(base);
}

function persistExtras(userId: string, extras: GamificationExtras) {
  saveGamificationExtras(userId, extras);
}

function mergeReferralSummary(
  extras: GamificationExtras,
  summary: ReferralSummaryDto,
): GamificationExtras {
  const activados = summary.activados;
  return {
    ...extras,
    referidos: {
      ...extras.referidos,
      codigo: summary.codigo,
      activados,
      usosEstaSemana: summary.usosEstaSemana,
      codigoReferidor: summary.codigoReferidor,
      puedeAplicarCodigo: summary.puedeAplicarCodigo,
      tiers: REFERRAL_MILESTONES.map((t) => ({
        activados: t.activados,
        label: t.label,
        rewards: [...t.rewards],
        completado: activados >= t.activados,
      })),
    },
  };
}

function mergeSummary(prev: GamificationData, summary: ActivitySummaryDto): GamificationData {
  const nivel = summary.nivel ?? 1;
  const xpActual = summary.xpActual ?? 0;
  const xpSiguienteNivel = summary.xpSiguienteNivel ?? 400;
  const titulo = summary.titulo ?? prev.user.titulo;
  const tituloSiguienteNivel =
    summary.tituloSiguienteNivel ?? prev.tituloSiguienteNivel;

  const actividades = prev.actividadesHoy.map((a) => {
    if (a.id === "checkin") return { ...a, completado: summary.checkinHoy };
    if (a.id === "tarea") return { ...a, completado: summary.rachas.tareas.hoy };
    if (a.id === "study" || a.id === "pdf" || a.id === "quiz") {
      return { ...a, completado: summary.rachas.estudio.hoy };
    }
    return a;
  });

  return {
    ...prev,
    user: {
      ...prev.user,
      nivel,
      titulo,
      xpActual,
      xpSiguienteNivel,
    },
    tituloSiguienteNivel,
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
    historialXP:
      summary.historialXP?.length ? summary.historialXP : prev.historialXP,
    extras: {
      ...prev.extras,
      liga: {
        ...prev.extras.liga,
        xpSemana: summary.xpTareasSemana,
      },
    },
    historialSemanas: summary.historialSemanas,
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
      const [summary, referralSummary] = await Promise.all([
        getActivitySummary(token),
        getReferralSummary(token).catch(() => null),
      ]);
      setData((prev) => {
        const nivel = summary.nivel ?? 1;
        if (nivel > (prev.user.nivel ?? 1)) {
          setLevelModalOpen(true);
        }
        let next = mergeSummary(prev, summary);
        if (referralSummary) {
          next = syncReferralBadges({
            ...next,
            extras: mergeReferralSummary(next.extras, referralSummary),
          });
        }
        return next;
      });
    } catch {
      setData((prev) => {
        const level = computeLevelProgress(0);
        return {
          ...prev,
          user: {
            ...prev.user,
            nivel: level.nivel,
            titulo: level.titulo,
            xpActual: level.xpActual,
            xpSiguienteNivel: level.xpSiguienteNivel,
          },
          tituloSiguienteNivel: level.tituloSiguienteNivel,
        };
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const awardBonusXp = useCallback(
    async (amount: number, source: string) => {
      if (!token || amount <= 0) return;
      try {
        await recordBonusXp(token, amount, source);
        const summary = await getActivitySummary(token);
        setData((prev) => {
          const nextNivel = summary.nivel ?? 1;
          if (nextNivel > (prev.user.nivel ?? 1)) {
            setLevelModalOpen(true);
          }
          return mergeSummary(prev, summary);
        });
      } catch {
        // ignore
      }
    },
    [token],
  );

  const recordActivityFn = useCallback(
    async (type: ActivityType) => {
      if (!token) return;
      const wasStudyDone = data.rachas.estudio.hoy;
      try {
        await recordActivity(token, type);
        const summary = await getActivitySummary(token);
        setData((prev) => {
          const nextNivel = summary.nivel ?? 1;
          if (nextNivel > (prev.user.nivel ?? 1)) {
            setLevelModalOpen(true);
          }
          return mergeSummary(prev, summary);
        });
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
              void awardBonusXp(reward.valor, "treasure_chest");
            }
            setTreasureReward(reward);
          }
        }
      } catch {
        // ignore
      }
    },
    [token, data.rachas.estudio.hoy, data.extras, user?.id, applyExtras, awardBonusXp],
  );

  const copyReferralCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.extras.referidos.codigo);
      return true;
    } catch {
      return false;
    }
  }, [data.extras.referidos.codigo]);

  const applyReferralCode = useCallback(
    async (code: string) => {
      if (!token) throw new Error("Debes iniciar sesión");
      const referralSummary = await applyReferralCodeApi(token, code);
      const summary = await getActivitySummary(token);
      setData((prev) => {
        const mergedExtras = mergeReferralSummary(prev.extras, referralSummary);
        if (user?.id) persistExtras(user.id, mergedExtras);
        return syncReferralBadges({
          ...mergeSummary(prev, summary),
          extras: mergedExtras,
        });
      });
    },
    [token, user?.id],
  );

  const claimMission = useCallback(
    (missionId: string) => {
      if (!user?.id) return;
      const result = completeMission(user.id, missionId);
      if (!result) return;
      const loaded = loadGamificationExtras(user.id);
      if (loaded) applyExtras(loaded);
      setData((prev) =>
        syncReferralBadges({ ...prev, extras: loaded ?? prev.extras }),
      );
      void awardBonusXp(result.xpGained, `mission_${missionId}`);
    },
    [user?.id, applyExtras, awardBonusXp],
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
      void awardBonusXp(reward.valor, "treasure_chest");
    }
    setTreasureReward(reward);
  }, [user?.id, applyExtras, awardBonusXp]);

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
    setData((prev) => syncReferralBadges({ ...prev, extras }));
    void awardBonusXp(500, "referral_simulation");
  }, [user?.id, data.extras, awardBonusXp]);

  useEffect(() => {
    if (user?.id) {
      setData(syncReferralBadges(defaultData(user?.name, user.id)));
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
    void awardBonusXp(400, "demo_level_up");
    setLevelModalOpen(true);
  }, [awardBonusXp]);

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
      applyReferralCode,
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
      applyReferralCode,
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
