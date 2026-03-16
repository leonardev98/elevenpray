"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import {
  updateProfile,
  getProfilePhotoUploadUrl,
  uploadFileToPresignedUrl,
} from "@/app/lib/auth-api";
import { toast } from "@/app/lib/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsSectionHeader } from "../settings-section-header";
import { Camera, Pencil, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors dark:border-[var(--app-border)] dark:bg-[var(--app-bg)] dark:text-[var(--app-fg)] dark:placeholder:text-[var(--app-fg-muted)] dark:focus:border-[var(--app-navy)] dark:focus:ring-[var(--app-navy)]";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ProfileSection() {
  const t = useTranslations("developerWorkspace.settingsPage");
  const { user, token, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? "");
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("errorUpdatingProfile"), "El archivo debe ser una imagen.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error(t("errorUpdatingProfile"), t("photoHint"));
      e.target.value = "";
      return;
    }
    setUploadingPhoto(true);
    try {
      const { uploadUrl, publicUrl } = await getProfilePhotoUploadUrl(
        token,
        file.type,
      );
      await uploadFileToPresignedUrl(file, uploadUrl);
      const updated = await updateProfile(token, { avatarUrl: publicUrl });
      updateUser(updated);
      toast.success(t("profileUpdated"), "");
    } catch (err) {
      toast.error(
        t("errorUpdatingProfile"),
        err instanceof Error ? err.message : "Error al subir la foto",
      );
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <SettingsSectionHeader titleKey="profile" descriptionKey="profileDescription" />

      {/* 1. User Identity Card */}
      <Card className="overflow-hidden rounded-2xl border-neutral-200 bg-white shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
            <button
              type="button"
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 text-2xl font-semibold text-neutral-600 shadow-inner transition-all duration-200 hover:border-neutral-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-70 dark:border-[var(--app-border)] dark:bg-[var(--app-surface-soft)] dark:text-[var(--app-fg)] dark:shadow-none dark:hover:border-[var(--app-navy)]/50 dark:focus-visible:ring-offset-[var(--app-bg)]"
              aria-label={t("changePhoto")}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="select-none">{initials}</span>
              )}
              {uploadingPhoto ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/70 dark:bg-[var(--app-navy)]/85">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </span>
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-neutral-900/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[var(--app-navy)]/85">
                  <Camera className="h-6 w-6 text-white" />
                  <span className="text-xs font-medium text-white">{t("changePhoto")}</span>
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-hidden
              onChange={handlePhotoChange}
            />
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <p className="text-lg font-semibold text-neutral-900 dark:text-[var(--app-fg)]">
                {user?.name ?? "—"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-[var(--app-fg-muted)]">
                {user?.email ?? "—"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-3 gap-2 border-2 font-medium",
                  "border-neutral-300 bg-neutral-50 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900",
                  "dark:border-[var(--app-border)] dark:bg-[var(--app-surface-soft)] dark:text-[var(--app-fg)] dark:hover:border-[var(--app-navy)] dark:hover:bg-[var(--app-navy)]/20 dark:hover:text-[var(--app-navy)]"
                )}
              >
                <Camera className="h-4 w-4 shrink-0" />
                {t("changePhoto")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Editable Fields Section - Account information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-[var(--app-fg)]">
          {t("accountInformation")}
        </h3>
        <Card className="overflow-hidden rounded-2xl border-neutral-200 bg-white shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]">
          <div className="divide-y divide-neutral-200 dark:divide-[var(--app-border)]">
            {/* Name row */}
            <div className="flex flex-col gap-3 py-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-[var(--app-fg-muted)]">
                  {t("name")}
                </p>
                {editingName ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className={cn(inputClass, "max-w-[280px]")}
                      placeholder={t("name")}
                      autoFocus
                      disabled={savingName}
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="gap-1.5"
                      >
                        {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {savingName ? t("saving") : t("save")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingName(false);
                          setNameValue(user?.name ?? "");
                        }}
                        disabled={savingName}
                        aria-label={t("cancel")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 text-base font-medium text-neutral-900 dark:text-[var(--app-fg)]">
                    {user?.name ?? "—"}
                  </p>
                )}
              </div>
              {!editingName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setNameValue(user?.name ?? "");
                    setEditingName(true);
                  }}
                  className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                  aria-label={t("editName")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Email row */}
            <div className="flex flex-col gap-3 py-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-[var(--app-fg-muted)]">
                  {t("email")}
                </p>
                {editingEmail ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className={cn(inputClass, "max-w-[280px]")}
                      placeholder={t("email")}
                      autoFocus
                      disabled={savingEmail}
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEmail}
                        disabled={savingEmail}
                        className="gap-1.5"
                      >
                        {savingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        {savingEmail ? t("saving") : t("save")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingEmail(false);
                          setEmailValue(user?.email ?? "");
                        }}
                        disabled={savingEmail}
                        aria-label={t("cancel")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 text-base font-medium text-neutral-900 dark:text-[var(--app-fg)]">
                    {user?.email ?? "—"}
                  </p>
                )}
              </div>
              {!editingEmail && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEmailValue(user?.email ?? "");
                    setEditingEmail(true);
                  }}
                  className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                  aria-label={t("editEmail")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
