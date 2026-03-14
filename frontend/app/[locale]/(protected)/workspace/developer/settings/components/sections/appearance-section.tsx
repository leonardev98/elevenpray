"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useTheme } from "@/app/providers/theme-provider";
import type { Theme } from "@/app/providers/theme-provider";
import { toast } from "@/app/lib/toast";
import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsCard } from "../settings-card";
import { SettingsSelect, type SettingsSelectOption } from "../settings-select";
const THEME_OPTIONS: { value: Theme; labelKey: string }[] = [
  { value: "light", labelKey: "themeLight" },
  { value: "dark", labelKey: "themeDark" },
  { value: "system", labelKey: "themeSystem" },
];

const LOCALE_OPTIONS: { value: string; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

export function AppearanceSection() {
  const t = useTranslations("developerWorkspace.settingsPage");
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();

  const themeOptions: SettingsSelectOption[] = THEME_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }));

  function handleThemeChange(value: string) {
    setTheme(value as Theme);
    toast.success(t("saved"), "");
  }

  function handleLanguageChange(value: string) {
    if (value === locale) return;
    const base = pathname?.startsWith("/") ? pathname : `/${pathname ?? ""}`;
    const newPath = `/${value}${base}`;
    window.location.href = newPath;
  }

  return (
    <>
      <SettingsSectionHeader titleKey="appearance" descriptionKey="appearanceDescription" />
      <SettingsCard>
      <SettingsSelect
        label={t("theme")}
        value={theme}
        onValueChange={handleThemeChange}
        options={themeOptions}
      />
      <SettingsSelect
        label={t("language")}
        value={locale}
        onValueChange={handleLanguageChange}
        options={LOCALE_OPTIONS}
      />
      </SettingsCard>
    </>
  );
}
