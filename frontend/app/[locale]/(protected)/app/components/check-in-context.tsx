"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { hasCheckInToday } from "../lib/student-storage";

type CheckInContextValue = {
  gateOpen: boolean;
  openGate: () => void;
  closeGate: () => void;
  refreshCheckIn: () => void;
  checkedInToday: boolean;
};

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [gateOpen, setGateOpen] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(true);

  const refreshCheckIn = useCallback(() => {
    setCheckedInToday(hasCheckInToday());
  }, []);

  useEffect(() => {
    refreshCheckIn();
    if (!hasCheckInToday()) {
      setGateOpen(true);
    }
  }, [refreshCheckIn]);

  const openGate = useCallback(() => setGateOpen(true), []);
  const closeGate = useCallback(() => setGateOpen(false), []);

  return (
    <CheckInContext.Provider
      value={{
        gateOpen,
        openGate,
        closeGate,
        refreshCheckIn,
        checkedInToday,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error("useCheckIn must be used within CheckInProvider");
  return ctx;
}
