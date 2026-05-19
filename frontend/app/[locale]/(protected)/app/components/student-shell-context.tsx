"use client";

import { createContext, useContext, type ReactNode } from "react";

const StudentShellContext = createContext<{ openMobileMenu: () => void } | null>(null);

export function StudentShellProvider({
  children,
  openMobileMenu,
}: {
  children: ReactNode;
  openMobileMenu: () => void;
}) {
  return (
    <StudentShellContext.Provider value={{ openMobileMenu }}>
      {children}
    </StudentShellContext.Provider>
  );
}

export function useStudentShell() {
  const ctx = useContext(StudentShellContext);
  return ctx ?? { openMobileMenu: undefined };
}
