"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const FOCUS_MODE_STORAGE_KEY = "elevenpray_developer_focus_mode";

function getStoredFocusMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

interface FocusModeContextValue {
  isFocusMode: boolean;
  setFocusMode: (value: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isFocusMode, setFocusModeState] = useState(false);

  useEffect(() => {
    setFocusModeState(getStoredFocusMode());
  }, []);

  const setFocusMode = useCallback((value: boolean) => {
    setFocusModeState(value);
    try {
      localStorage.setItem(FOCUS_MODE_STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) {
    return {
      isFocusMode: false,
      setFocusMode: () => {},
    };
  }
  return ctx;
}
