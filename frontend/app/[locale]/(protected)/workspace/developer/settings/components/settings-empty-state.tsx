"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsEmptyStateProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  actionLabelKey?: string;
  onAction?: () => void;
  /** Compact variant: small inline message instead of large centered panel */
  compact?: boolean;
  className?: string;
}

export function SettingsEmptyState({
  icon: Icon,
  titleKey,
  descriptionKey,
  actionLabelKey,
  onAction,
  compact = false,
  className,
}: SettingsEmptyStateProps) {
  const t = useTranslations("developerWorkspace.settingsPage");

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-[var(--app-border)]/60 bg-[var(--app-bg)]/40 py-4 px-4 transition-all duration-200",
          className
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10 text-[var(--app-navy)]">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm text-[var(--app-fg)]/70">
          {t(descriptionKey)}
        </p>
        {actionLabelKey && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="ml-auto shrink-0 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] transition-colors hover:bg-[var(--app-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30"
          >
            {t(actionLabelKey)}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/30 py-12 px-6 text-center transition-all duration-200",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-navy)]/10 text-[var(--app-navy)]">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-sm font-medium text-[var(--app-fg)]">
        {t(titleKey)}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-[var(--app-fg)]/60">
        {t(descriptionKey)}
      </p>
      {actionLabelKey && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-medium text-[var(--app-fg)] transition-colors hover:bg-[var(--app-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30"
        >
          {t(actionLabelKey)}
        </button>
      )}
    </div>
  );
}
