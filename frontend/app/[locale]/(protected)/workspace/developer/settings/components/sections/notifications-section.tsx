"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/app/lib/toast";
import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsCard } from "../settings-card";
import { SettingsToggle } from "../settings-toggle";

const STORAGE_KEY = "elevenpray_notifications";

interface NotificationPrefs {
  email: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  email: true,
  productUpdates: true,
  securityAlerts: false,
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
      return { ...defaultPrefs, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultPrefs;
}

function savePrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function NotificationsSection() {
  const t = useTranslations("developerWorkspace.settingsPage");
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setMounted(true);
  }, []);

  function update(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    if (mounted) toast.success(t("saved"), "");
  }

  return (
    <>
      <SettingsSectionHeader titleKey="notifications" descriptionKey="notificationsDescription" />
      <SettingsCard>
      <SettingsToggle
        label={t("emailNotifications")}
        checked={prefs.email}
        onCheckedChange={(v) => update("email", v)}
      />
      <SettingsToggle
        label={t("productUpdates")}
        checked={prefs.productUpdates}
        onCheckedChange={(v) => update("productUpdates", v)}
      />
      <SettingsToggle
        label={t("securityAlerts")}
        checked={prefs.securityAlerts}
        onCheckedChange={(v) => update("securityAlerts", v)}
      />
      </SettingsCard>
    </>
  );
}
