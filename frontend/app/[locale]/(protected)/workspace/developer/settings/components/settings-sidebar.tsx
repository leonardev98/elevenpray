"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsSectionId =
  | "profile"
  | "account"
  | "security"
  | "appearance"
  | "notifications"
  | "privacy";

export interface SettingsSectionConfig {
  id: SettingsSectionId;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

interface SettingsSidebarProps {
  sections: SettingsSectionConfig[];
  activeSection: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
  className?: string;
}

const PANEL_ID = "settings-content-panel";

export function SettingsSidebar({
  sections,
  activeSection,
  onSelect,
  className,
}: SettingsSidebarProps) {
  const t = useTranslations("developerWorkspace.settingsPage");

  return (
    <nav
      aria-label={t("title")}
      className={cn("flex flex-col gap-0.5", className)}
    >
      {/* Mobile: horizontal scroll */}
      <ul className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--app-border)] lg:flex-col lg:overflow-visible lg:pb-0">
        {sections.map(({ id, icon: Icon, titleKey, descriptionKey }) => {
          const isActive = activeSection === id;
          return (
            <li key={id} className="w-[180px] shrink-0 lg:w-full">
              <motion.button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={PANEL_ID}
                id={`settings-nav-${id}`}
                onClick={() => onSelect(id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border-l-2 px-4 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]",
                  "min-w-0 lg:min-w-[unset]",
                  isActive
                    ? "border-l-[var(--app-navy)] bg-[var(--app-bg)] text-[var(--app-navy)]"
                    : "border-l-transparent text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)]/70 hover:text-[var(--app-fg)]"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                    isActive ? "bg-[var(--app-navy)]/15" : "bg-[var(--app-bg)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {t(titleKey)}
                  </span>
                  <span className="mt-0.5 hidden text-xs text-[var(--app-fg)]/60 line-clamp-2 lg:block">
                    {t(descriptionKey)}
                  </span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { PANEL_ID };
