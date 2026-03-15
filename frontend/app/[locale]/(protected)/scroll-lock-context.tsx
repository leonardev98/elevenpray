"use client";

import { createContext, useCallback, useContext } from "react";

type SetScrollLocked = (locked: boolean) => void;

const ScrollLockContext = createContext<SetScrollLocked | null>(null);

export function useScrollLock() {
  const setLocked = useContext(ScrollLockContext);
  return useCallback(
    (locked: boolean) => {
      setLocked?.(locked);
    },
    [setLocked]
  );
}

export { ScrollLockContext };
