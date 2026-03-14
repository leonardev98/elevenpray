"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  children,
  className,
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition-all duration-200",
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-sm font-medium text-[var(--app-fg)]/80">
          {title}
        </h3>
      )}
      <div className="divide-y divide-[var(--app-border)]/60">{children}</div>
    </div>
  );
}
