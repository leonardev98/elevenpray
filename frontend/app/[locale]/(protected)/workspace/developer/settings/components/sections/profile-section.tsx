"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { updateProfile } from "@/app/lib/auth-api";
import { toast } from "@/app/lib/toast";
import { SettingsSectionHeader } from "../settings-section-header";
import { SettingsCard } from "../settings-card";
import { SettingsItem } from "../settings-item";
import { SettingsAction } from "../settings-action";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full min-w-0 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20 transition-all duration-200";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ProfileSection() {
  const t = useTranslations("developerWorkspace.settingsPage");
  const { user, token, updateUser } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const initials = user?.name
    ?.split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  async function handleSaveName() {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      toast.error(t("errorUpdatingProfile"), t("nameRequired"));
      return;
    }
    if (!token) return;
    setSavingName(true);
    try {
      const updated = await updateProfile(token, { name: trimmed });
      updateUser(updated);
      toast.success(t("profileUpdated"), "");
      setEditingName(false);
    } catch (e) {
      toast.error(t("errorUpdatingProfile"), e instanceof Error ? e.message : "");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSaveEmail() {
    const trimmed = emailValue.trim();
    if (!trimmed) {
      toast.error(t("errorUpdatingProfile"), t("emailRequired"));
      return;
    }
    if (!isValidEmail(trimmed)) {
      toast.error(t("errorUpdatingProfile"), t("invalidEmail"));
      return;
    }
    if (!token) return;
    setSavingEmail(true);
    try {
      const updated = await updateProfile(token, { email: trimmed });
      updateUser(updated);
      toast.success(t("profileUpdated"), "");
      setEditingEmail(false);
    } catch (e) {
      toast.error(t("errorUpdatingProfile"), e instanceof Error ? e.message : "");
    } finally {
      setSavingEmail(false);
    }
  }

  return (
    <>
      <SettingsSectionHeader titleKey="profile" descriptionKey="profileDescription" />
      <SettingsCard>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--app-navy)]/10 text-2xl font-semibold text-[var(--app-navy)]">
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <SettingsAction
                label={t("changePhoto")}
                onClick={() => {}}
                disabled
              />
              <SettingsAction
                label={t("removePhoto")}
                onClick={() => {}}
                disabled
                variant="ghost"
              />
            </div>
          </div>
          <SettingsItem label={t("name")}>
            {editingName ? (
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className={cn(inputClass, "max-w-[220px]")}
                  placeholder={t("name")}
                  autoFocus
                  disabled={savingName}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className={cn(
                      "rounded-lg border border-[var(--app-navy)] bg-[var(--app-navy)] px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50",
                    )}
                  >
                    {savingName ? t("saving") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingName(false);
                      setNameValue(user?.name ?? "");
                    }}
                    disabled={savingName}
                    className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm font-medium text-[var(--app-fg)] transition-all duration-200 hover:bg-[var(--app-bg)] disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--app-fg)]/80">
                  {user?.name ?? "—"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNameValue(user?.name ?? "");
                    setEditingName(true);
                  }}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-[var(--app-fg)]/60 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30"
                  aria-label={t("editName")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </SettingsItem>
          <SettingsItem label={t("email")}>
            {editingEmail ? (
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className={cn(inputClass, "max-w-[260px]")}
                  placeholder={t("email")}
                  autoFocus
                  disabled={savingEmail}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    disabled={savingEmail}
                    className="rounded-lg border border-[var(--app-navy)] bg-[var(--app-navy)] px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  >
                    {savingEmail ? t("saving") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmail(false);
                      setEmailValue(user?.email ?? "");
                    }}
                    disabled={savingEmail}
                    className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm font-medium text-[var(--app-fg)] transition-all duration-200 hover:bg-[var(--app-bg)] disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--app-fg)]/80">
                  {user?.email ?? "—"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailValue(user?.email ?? "");
                    setEditingEmail(true);
                  }}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-[var(--app-fg)]/60 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30"
                  aria-label={t("editEmail")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </SettingsItem>
        </div>
      </SettingsCard>
    </>
  );
}
