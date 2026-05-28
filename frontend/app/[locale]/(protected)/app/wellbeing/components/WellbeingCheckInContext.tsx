"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWellbeingCheckIn } from "../hooks/useWellbeingCheckIn";
import type { MoodId } from "../wellbeing-types";

type WellbeingCheckInContextValue = ReturnType<typeof useWellbeingCheckIn>;

const WellbeingCheckInContext = createContext<WellbeingCheckInContextValue | null>(null);

export function WellbeingCheckInProvider({ children }: { children: ReactNode }) {
  const value = useWellbeingCheckIn();
  return (
    <WellbeingCheckInContext.Provider value={value}>{children}</WellbeingCheckInContext.Provider>
  );
}

export function useWellbeingCheckInContext() {
  const ctx = useContext(WellbeingCheckInContext);
  if (!ctx) {
    throw new Error("useWellbeingCheckInContext must be used within WellbeingCheckInProvider");
  }
  return ctx;
}

export type { MoodId, MoodFactorId } from "../wellbeing-types";
