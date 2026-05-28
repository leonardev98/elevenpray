"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDayEntries } from "../hooks/useDayEntries";

type WellbeingDayContextValue = ReturnType<typeof useDayEntries>;

const WellbeingDayContext = createContext<WellbeingDayContextValue | null>(null);

export function WellbeingDayProvider({ children, date }: { children: ReactNode; date?: string }) {
  const value = useDayEntries(date);
  return <WellbeingDayContext.Provider value={value}>{children}</WellbeingDayContext.Provider>;
}

export function useWellbeingDayContext() {
  const ctx = useContext(WellbeingDayContext);
  if (!ctx) {
    throw new Error("useWellbeingDayContext must be used within WellbeingDayProvider");
  }
  return ctx;
}
