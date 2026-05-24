"use client";

import type { ReactNode } from "react";
import { StudentTopBar } from "./StudentTopBar";

export function StudentPageShell({
  children,
  title,
  maxWidth = "max-w-5xl",
  hideTopBar = false,
  compact = false,
}: {
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  hideTopBar?: boolean;
  /** Menos padding vertical (p. ej. Mi plan en una sola vista) */
  compact?: boolean;
}) {
  return (
    <>
      {!hideTopBar && <StudentTopBar title={title} />}
      <main
        className={`mx-auto w-full flex-1 px-4 lg:px-8 ${maxWidth} ${
          compact ? "py-3" : "py-6"
        }`}
      >
        {children}
      </main>
    </>
  );
}
