"use client";

import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsEmptyState } from "../settings-empty-state";
import { Settings } from "lucide-react";

export function AccountSection() {
  return (
    <>
      <SettingsSectionHeader titleKey="account" descriptionKey="accountDescription" />
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
