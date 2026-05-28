"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { getTodayEmotionalCheckIn } from "@/app/lib/emotional-checkins-api";
import { getActivitySummary } from "@/app/lib/student-activity/api";
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
  const { token, user, isLoading: authLoading } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(true);

  const resolveCheckInStatus = useCallback(async () => {
    const userId = user?.id ?? null;

    if (hasCheckInToday(userId)) {
      setCheckedInToday(true);
      return true;
    }

    if (token) {
      try {
        const emotional = await getTodayEmotionalCheckIn(token);
        if (emotional?.mood) {
          setCheckedInToday(true);
          return true;
        }
      } catch {
        /* fallback */
      }

      try {
        const summary = await getActivitySummary(token);
        if (summary.checkinHoy) {
          setCheckedInToday(true);
          return true;
        }
      } catch {
        /* use local only */
      }
    }

    setCheckedInToday(false);
    return false;
  }, [token, user?.id]);

  const refreshCheckIn = useCallback(() => {
    const userId = user?.id ?? null;
    setCheckedInToday(hasCheckInToday(userId));
    void resolveCheckInStatus();
  }, [user?.id, resolveCheckInStatus]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    void (async () => {
      const done = await resolveCheckInStatus();
      if (!cancelled && !done) {
        setGateOpen(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, resolveCheckInStatus]);

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
