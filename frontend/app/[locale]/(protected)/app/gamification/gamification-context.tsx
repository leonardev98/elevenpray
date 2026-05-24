"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  gamificationData,
  MOCK_TODAY_INDEX,
  type GamificationData,
} from "@/data/gamification";

type GamificationContextValue = {
  data: GamificationData;
  streakJustCompleted: boolean;
  levelModalOpen: boolean;
  simulateStudyStreakToday: () => void;
  simulateLevelUp: () => void;
  clearStreakAnimation: () => void;
  closeLevelModal: () => void;
};

const GamificationContext = createContext<GamificationContextValue | null>(null);

function cloneData(): GamificationData {
  return JSON.parse(JSON.stringify(gamificationData)) as GamificationData;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GamificationData>(cloneData);
  const [streakJustCompleted, setStreakJustCompleted] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  const simulateStudyStreakToday = useCallback(() => {
    const todayIndex = MOCK_TODAY_INDEX;
    setData((prev) => {
      const wasDone = prev.rachas.estudio.hoy;
      const next = { ...prev, rachas: { ...prev.rachas, estudio: { ...prev.rachas.estudio } } };
      next.rachas.estudio.hoy = true;
      next.rachas.estudio.semana = [...prev.rachas.estudio.semana];
      next.rachas.estudio.semana[todayIndex] = true;
      if (!wasDone) {
        next.rachas.estudio.actual = prev.rachas.estudio.actual + 1;
      }
      const lastRow = [...prev.historialSemanas.estudio[3]];
      lastRow[todayIndex] = true;
      next.historialSemanas = {
        ...prev.historialSemanas,
        estudio: prev.historialSemanas.estudio.map((row, i) =>
          i === 3 ? lastRow : [...row],
        ),
      };
      return next;
    });
    setStreakJustCompleted(true);
  }, []);

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
      streakJustCompleted,
      levelModalOpen,
      simulateStudyStreakToday,
      simulateLevelUp,
      clearStreakAnimation,
      closeLevelModal,
    }),
    [
      data,
      streakJustCompleted,
      levelModalOpen,
      simulateStudyStreakToday,
      simulateLevelUp,
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
