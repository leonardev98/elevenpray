"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, LogOut, Pencil, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { Link, useRouter } from "@/i18n/navigation";
import {
  getProfilePhotoUploadUrl,
  updateProfile,
  uploadFileToPresignedUrl,
} from "@/app/lib/auth-api";
import { toast } from "@/app/lib/toast";
import { getStudentProfile, type StudentProfile } from "../lib/student-storage";
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

export default function StudentProfilePage() {
  const t = useTranslations("studentProfile");
  const { user, token, updateUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    setStudentProfile(getStudentProfile());
  }, []);

  useEffect(() => {
    if (user?.name && !savingName) setName(user.name);
  }, [user?.name, savingName]);

  const nameDirty = useMemo(
    () => name.trim().length > 0 && name.trim() !== (user?.name ?? ""),
    [name, user?.name],
  );

  const initials = getInitials(user?.name || user?.email);
  const avatarUrl = user?.avatarUrl ?? null;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-elegir el mismo archivo
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

  function handleLogout() {
    if (!window.confirm(t("logoutConfirm"))) return;
    logout();
    router.replace("/");
  }

  const studies = [
    { label: t("university"), value: studentProfile?.university || t("noUniversity") },
    { label: t("career"), value: studentProfile?.career || "—" },
    { label: t("cycle"), value: studentProfile?.cycle || "—" },
    { label: t("gradeScale"), value: "0 – 20 (Perú)" },
  ];

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
        {/* ============================================================
            SECCIÓN: Identidad — foto + nombre + email
        ============================================================ */}
        <section>
          <SectionHeader
            title={t("sectionIdentity")}
            description={t("sectionIdentityDesc")}
          />
          <div className="student-card mt-3 overflow-hidden p-0">
            {/* Foto */}
            <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center">
              <div className="relative">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] ring-2 ring-[var(--border)]">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user?.name ?? ""}
                      fill
                      sizes="80px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                      {initials}
                    </span>
                  )}
                  {photoUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={photoUploading}
                  aria-label={avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-md transition hover:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t("photo")}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {t("photoDesc")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={photoUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {avatarUrl ? (
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
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
                      className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-transparent px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {t("removePhoto")}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t-[0.5px] border-[var(--border)]" />

            {/* Nombre */}
            <div className="px-5 py-5">
              <label
                htmlFor="profile-name"
                className="text-sm font-medium text-[var(--text-primary)]"
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
                className="mt-2 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition focus:border-[var(--accent)]/60 focus:bg-[var(--bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
              {nameDirty && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingName ? t("saving") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardName}
                    disabled={savingName}
                    className="inline-flex items-center gap-1.5 rounded-lg border-[0.5px] border-[var(--border)] bg-transparent px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("discard")}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t-[0.5px] border-[var(--border)]" />

            {/* Email — read-only, sincronizado con Google */}
            <div className="px-5 py-5">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t("email")}
              </p>
              <p className="mt-2 truncate text-sm text-[var(--text-primary)]/90">
                {user?.email ?? "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {t("emailReadOnly")}
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECCIÓN: Estudios
        ============================================================ */}
        <section>
          <SectionHeader
            title={t("sectionStudies")}
            description={t("sectionStudiesDesc")}
          />
          <div className="student-card mt-3 divide-y divide-[var(--border)] p-0">
            {studies.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <span className="text-sm text-[var(--text-muted)]">
                  {field.label}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {field.value}
                </span>
              </div>
            ))}
            <div className="px-5 py-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t("editStudies")}
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECCIÓN: Apariencia
        ============================================================ */}
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

        {/* ============================================================
            SECCIÓN: Zona de cuenta
        ============================================================ */}
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
