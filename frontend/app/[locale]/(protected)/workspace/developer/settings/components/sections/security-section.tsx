"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsCard } from "../settings-card";
import { SettingsItem } from "../settings-item";
import { SettingsAction } from "../settings-action";
import { ChangePasswordModal } from "../change-password-modal";

export function SecuritySection() {
  const t = useTranslations("developerWorkspace.settingsPage");
  const { token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <SettingsSectionHeader titleKey="security" descriptionKey="securityDescription" />
      <SettingsCard>
        <SettingsItem label={t("changePassword")}>
          <SettingsAction
            label={t("changePassword")}
            onClick={() => setModalOpen(true)}
          />
        </SettingsItem>
      </SettingsCard>
      <ChangePasswordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        token={token}
      />
    </>
  );
}
