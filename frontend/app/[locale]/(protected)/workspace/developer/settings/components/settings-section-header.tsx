"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SettingsSectionHeaderProps {
  titleKey: string;
  descriptionKey: string;
  className?: string;
}

export function SettingsSectionHeader({
  titleKey,
  descriptionKey,
  className,
}: SettingsSectionHeaderProps) {
  const t = useTranslations("developerWorkspace.settingsPage");

  return (
    <header className={cn("mb-6", className)}>
      <h2 className="text-xl font-semibold text-[var(--app-fg)]">
        {t(titleKey)}
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--app-fg-muted)]">
        {t(descriptionKey)}
      </p>
    </header>
  );
}
