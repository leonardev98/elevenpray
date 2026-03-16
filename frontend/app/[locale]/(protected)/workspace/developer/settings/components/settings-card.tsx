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
        "rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]",
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-sm font-medium text-neutral-700 dark:text-[var(--app-fg)]">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
