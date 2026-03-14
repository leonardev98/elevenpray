"use client";

import { useTranslations } from "next-intl";
import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsEmptyState } from "../settings-empty-state";
import { Settings } from "lucide-react";

export function PrivacySection() {
  const t = useTranslations("developerWorkspace.settingsPage");

  return (
    <>
      <SettingsSectionHeader titleKey="privacy" descriptionKey="privacyDescription" />
      <SettingsEmptyState
        icon={Settings}
        titleKey="emptyTitle"
        descriptionKey="comingSoonSectionDescription"
        actionLabelKey="comingSoon"
        onAction={() => {}}
        compact
      />
    </>
  );
}
