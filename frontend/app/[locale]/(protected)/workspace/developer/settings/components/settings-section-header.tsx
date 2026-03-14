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
      <p className="mt-1 text-sm text-[var(--app-fg)]/60">
        {t(descriptionKey)}
      </p>
    </header>
  );
}
