"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  header?: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingsLayout({
  header,
  sidebar,
  children,
  className,
}: SettingsLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-6 transition-all duration-200 lg:flex-row lg:gap-8",
        className
      )}
    >
      {header && <div className="shrink-0">{header}</div>}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="w-full shrink-0 lg:w-[260px]">{sidebar}</aside>
        <div className="min-w-0 max-w-3xl flex-1 focus:outline-none">
          {children}
        </div>
      </div>
    </div>
  );
}
