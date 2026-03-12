"use client";

import { useTranslations } from "next-intl";
import { Settings as SettingsIcon } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { LocaleSwitcher } from "@/app/components/locale-switcher";

export default function SettingsPage() {
  const t = useTranslations("developerWorkspace.sidebar");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("settings")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Preferences for the developer workspace.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-medium text-[var(--app-fg)]">
          <SettingsIcon className="h-5 w-5" />
          Appearance & locale
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--app-fg)]/70">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--app-fg)]/70">Language</span>
            <LocaleSwitcher />
          </div>
        </div>
      </section>
    </div>
  );
}
