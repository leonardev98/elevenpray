"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsItem({
  label,
  description,
  children,
  className,
}: SettingsItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg px-4 py-3 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        "hover:bg-[var(--app-bg)]/50",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--app-fg)]">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--app-fg)]/60">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-1 sm:pt-0">{children}</div>
    </div>
  );
}
