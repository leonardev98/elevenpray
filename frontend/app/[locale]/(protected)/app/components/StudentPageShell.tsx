"use client";

import type { ReactNode } from "react";
import { StudentTopBar } from "./StudentTopBar";

export function StudentPageShell({
  children,
  title,
  maxWidth = "max-w-5xl",
  hideTopBar = false,
}: {
  children: ReactNode;
  title?: string;
  maxWidth?: string;
  /** Calendario lleva cabecera propia */
  hideTopBar?: boolean;
}) {
  return (
    <>
      {!hideTopBar && <StudentTopBar title={title} />}
      <main className={`mx-auto w-full flex-1 px-4 py-6 lg:px-8 ${maxWidth}`}>{children}</main>
    </>
  );
}
