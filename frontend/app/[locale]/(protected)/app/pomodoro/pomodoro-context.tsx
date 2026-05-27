"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePomodoroTimer } from "./usePomodoroTimer";
import { StretchBreakModal } from "./components/StretchBreakModal";

type PomodoroContextValue = ReturnType<typeof usePomodoroTimer> & {
  showStretchModal: boolean;
  dismissStretchModal: () => void;
};

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [showStretchModal, setShowStretchModal] = useState(false);

  const onBreakStart = useCallback(() => {
    setShowStretchModal(true);
  }, []);

  const timer = usePomodoroTimer(onBreakStart);

  const dismissStretchModal = useCallback(() => {
    setShowStretchModal(false);
  }, []);

  const value = useMemo(
    () => ({
      ...timer,
      showStretchModal,
      dismissStretchModal,
    }),
    [timer, showStretchModal, dismissStretchModal],
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
      <StretchBreakModal
        open={showStretchModal}
        secondsLeft={timer.secondsLeft}
        phase={timer.phase}
        onClose={dismissStretchModal}
      />
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error("usePomodoro debe usarse dentro de PomodoroProvider");
  }
  return ctx;
}
