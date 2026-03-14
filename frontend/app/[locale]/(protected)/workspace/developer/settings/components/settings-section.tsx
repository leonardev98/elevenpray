"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {title && (
        <h2 className="text-lg font-semibold text-[var(--app-fg)]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
