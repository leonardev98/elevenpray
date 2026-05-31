"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, LogOut, Mail, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { useRouter } from "@/i18n/navigation";
import {
  getProfilePhotoUploadUrl,
  updateProfile,
  uploadFileToPresignedUrl,
  upsertStudentProfile,
} from "@/app/lib/auth-api";
import { toast } from "@/app/lib/toast";
import { defaultCycleYear } from "@/lib/student-cycle";
import { ProfileSectionSaveBar } from "@/components/student/profile-studies/ProfileSectionSaveBar";
import {
  buildStudiesPayload,
  StudentStudiesFields,
  studiesValuesFromProfile,
  type StudentStudiesFormValues,
} from "@/components/student/profile-studies/StudentStudiesFields";
import { getStudentProfile, saveStudentProfile } from "../lib/student-storage";
import { StudentPageShell } from "../components/StudentPageShell";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_PHOTO_MB = 5;
const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function serializeStudies(values: StudentStudiesFormValues): string {
  return JSON.stringify(buildStudiesPayload(values));
}

export default function StudentProfilePage() {
  const t = useTranslations("studentProfile");
  const { user, token, updateUser, refreshUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const profileSource = useMemo(
    () =>
      user?.studentProfile
        ? {
            university: user.studentProfile.university,
            career: user.studentProfile.career,
            cycle: user.studentProfile.cycle,
            institutionType: user.studentProfile.institutionType,
            gradeScale: user.studentProfile.gradeScale,
          }
        : getStudentProfile(user?.id),
    [user?.id, user?.studentProfile],
  );

  const baselineStudies = useMemo(
    () => studiesValuesFromProfile(profileSource, defaultCycleYear()),
    [profileSource],
  );

  const [studiesValues, setStudiesValues] =
    useState<StudentStudiesFormValues>(baselineStudies);
  const [studiesBaseline, setStudiesBaseline] = useState(
    () => serializeStudies(baselineStudies),
  );
  const [studiesFormKey, setStudiesFormKey] = useState(0);
  const [savingStudies, setSavingStudies] = useState(false);
  const [studiesSubmitAttempted, setStudiesSubmitAttempted] = useState(false);

  useEffect(() => {
    const next = studiesValuesFromProfile(profileSource, defaultCycleYear());
    setStudiesValues(next);
    setStudiesBaseline(serializeStudies(next));
    setStudiesFormKey((k) => k + 1);
  }, [profileSource]);

  useEffect(() => {
    if (user?.name && !savingName) setName(user.name);
  }, [user?.name, savingName]);

  const nameDirty = useMemo(
    () => name.trim().length > 0 && name.trim() !== (user?.name ?? ""),
    [name, user?.name],
  );

  const studiesDirty = useMemo(
    () => serializeStudies(studiesValues) !== studiesBaseline,
    [studiesValues, studiesBaseline],
  );

  const initials = getInitials(user?.name || user?.email);
  const avatarUrl = user?.avatarUrl ?? null;

  const handleStudiesChange = useCallback(
    (patch: Partial<StudentStudiesFormValues>) => {
      setStudiesValues((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("photoInvalidType"));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error(t("photoTooLarge", { max: MAX_PHOTO_MB }));
      return;
    }

    setPhotoUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getProfilePhotoUploadUrl(
        token,
        file.type,
      );
      await uploadFileToPresignedUrl(file, uploadUrl);
      const updated = await updateProfile(token, { avatarUrl: publicUrl });
      updateUser(updated);
      toast.success(t("photoUpdated"));
    } catch (err) {
      toast.error(
        t("saveError"),
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (!token) return;
    setPhotoUploading(true);
    try {
      const updated = await updateProfile(token, { avatarUrl: null });
      updateUser(updated);
      toast.success(t("photoRemoved"));
    } catch (err) {
      toast.error(
        t("saveError"),
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSaveName() {
    if (!token || !nameDirty) return;
    setSavingName(true);
    try {
      const updated = await updateProfile(token, { name: name.trim() });
      updateUser(updated);
      toast.success(t("saved"));
    } catch (err) {
      toast.error(
        t("saveError"),
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setSavingName(false);
    }
  }

  function handleDiscardName() {
    setName(user?.name ?? "");
  }

  async function handleSaveStudies() {
    if (!token || !studiesDirty) return;
    setStudiesSubmitAttempted(true);
    const payload = buildStudiesPayload(studiesValues);
    if (!payload.university || !payload.career || !payload.cycle) return;

    setSavingStudies(true);
    try {
      const updated = await upsertStudentProfile(token, payload);
      updateUser(updated);
      if (user?.id) {
        saveStudentProfile(
          {
            name: updated.name,
            university: payload.university,
            career: payload.career,
            cycle: payload.cycle,
            institutionType: payload.institutionType,
            gradeScale: payload.gradeScale,
          },
          user.id,
        );
      }
      await refreshUser();
      const next = studiesValuesFromProfile(
        updated.studentProfile ?? payload,
        defaultCycleYear(),
      );
      setStudiesValues(next);
      setStudiesBaseline(serializeStudies(next));
      setStudiesFormKey((k) => k + 1);
      setStudiesSubmitAttempted(false);
      toast.success(t("studiesSaved"));
    } catch (err) {
      toast.error(
        t("saveError"),
        err instanceof Error ? err.message : undefined,
      );
    } finally {
      setSavingStudies(false);
    }
  }

  function handleDiscardStudies() {
    const next = studiesValuesFromProfile(profileSource, defaultCycleYear());
    setStudiesValues(next);
    setStudiesBaseline(serializeStudies(next));
    setStudiesFormKey((k) => k + 1);
    setStudiesSubmitAttempted(false);
  }

  function handleLogout() {
    if (!window.confirm(t("logoutConfirm"))) return;
    logout();
    router.replace("/");
  }

  return (
    <StudentPageShell title={t("title")}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handlePhotoSelected}
        className="hidden"
      />

      <div className="space-y-8">
        <section>
          <SectionHeader
            title={t("sectionIdentity")}
            description={t("sectionIdentityDesc")}
          />
          <div className="student-card relative mt-3 overflow-hidden p-0">
            <div className="flex flex-col items-center gap-5 px-5 py-6 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--bg-surface)] text-[var(--accent)] ring-2 ring-[var(--border)] ring-offset-2 ring-offset-[var(--bg-elevated)] sm:h-28 sm:w-28">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user?.name ?? ""}
                      fill
                      sizes="112px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-tight">
                      {initials}
                    </span>
                  )}
                  {photoUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={photoUploading}
                  aria-label={avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                  className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-lg transition hover:scale-105 hover:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="min-w-0 flex-1 w-full space-y-4 text-center sm:text-left">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {t("name")}
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    disabled={savingName}
                    className="mt-1.5 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-base font-medium text-[var(--text-primary)] placeholder:font-normal placeholder:text-[var(--text-muted)] transition focus:border-[var(--accent)]/60 focus:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </div>

                <div className="inline-flex max-w-full items-center gap-2 rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{user?.email ?? "—"}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {t("emailReadOnly")}
                </p>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={photoUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {avatarUrl ? (
                      <Upload className="h-3.5 w-3.5 rotate-180" strokeWidth={1.75} />
                    ) : (
                      <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    {photoUploading
                      ? t("uploading")
                      : avatarUrl
                        ? t("changePhoto")
                        : t("uploadPhoto")}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={photoUploading}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {t("removePhoto")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <ProfileSectionSaveBar
              dirty={nameDirty}
              saving={savingName}
              onSave={() => void handleSaveName()}
              onDiscard={handleDiscardName}
              saveLabel={t("saveChanges")}
              savingLabel={t("saving")}
              discardLabel={t("discard")}
              unsavedHint={t("unsavedChangesHint")}
              idleHint={t("noPendingChangesHint")}
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title={t("sectionStudies")}
            description={t("sectionStudiesDesc")}
          />
          <div className="student-card relative mt-3 overflow-hidden p-0">
            <div className="px-5 py-5">
              <StudentStudiesFields
                key={studiesFormKey}
                values={studiesValues}
                onChange={handleStudiesChange}
                submitAttempted={studiesSubmitAttempted}
              />
            </div>

            <ProfileSectionSaveBar
              dirty={studiesDirty}
              saving={savingStudies}
              onSave={() => void handleSaveStudies()}
              onDiscard={handleDiscardStudies}
              saveLabel={t("saveChanges")}
              savingLabel={t("studiesSaving")}
              discardLabel={t("discard")}
              unsavedHint={t("unsavedStudiesHint")}
              idleHint={t("noPendingStudiesHint")}
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title={t("sectionAppearance")}
            description={t("sectionAppearanceDesc")}
          />
          <div className="student-card mt-3 p-5">
            <p className="text-xs text-[var(--text-muted)]">
              {t("themeCurrent", { mode: resolvedTheme })}
            </p>
            <div className="mt-3 inline-flex rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-1">
              {(["dark", "light", "system"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                    theme === mode
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t(`theme_${mode}`)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title={t("sectionDanger")} />
          <div className="student-card mt-3 p-5">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border-[0.5px] border-[var(--destructive)]/30 bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--destructive)] transition hover:bg-[var(--destructive)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--destructive)]/40"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              {t("logout")}
            </button>
          </div>
        </section>
      </div>
    </StudentPageShell>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-1">
      <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
      )}
    </div>
  );
}
