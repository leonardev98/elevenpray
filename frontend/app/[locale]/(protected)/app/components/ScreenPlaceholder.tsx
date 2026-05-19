"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export function ScreenPlaceholder({
  icon: Icon,
  title,
  description,
  badge,
  className,
}: ScreenPlaceholderProps) {
  return (
    <div
      className={cn(
        "student-card flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {badge && (
        <span className="mb-4 rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--app-primary)]">
          {badge}
        </span>
      )}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)]">
        <Icon className="h-7 w-7 text-[var(--app-primary)]" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-[var(--app-fg)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--app-fg-secondary)]">{description}</p>
    </div>
  );
}
