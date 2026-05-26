"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useTheme } from "@/app/providers/theme-provider";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getStudentProfile, type StudentProfile } from "../lib/student-storage";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentProfilePage() {
  const t = useTranslations("studentProfile");
  const { logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    setProfile(getStudentProfile());
  }, []);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  const fields = [
    { label: t("university"), value: profile?.university ?? "—" },
    { label: t("career"), value: profile?.career ?? "—" },
    { label: t("cycle"), value: profile?.cycle ?? "—" },
    { label: t("gradeScale"), value: "0 – 20 (Perú)" },
  ];

  return (
    <StudentPageShell title={t("title")}>
      <div className="student-card divide-y divide-[var(--app-border)]">
        {fields.map((field) => (
          <div key={field.label} className="flex justify-between gap-4 px-5 py-4">
            <span className="text-sm text-[var(--app-fg-secondary)]">{field.label}</span>
            <span className="text-sm font-medium text-[var(--app-fg)]">{field.value}</span>
          </div>
        ))}
      </div>

      <div className="student-card mt-6 p-5">
        <p className="text-sm font-medium text-[var(--app-fg)]">{t("theme")}</p>
        <p className="mt-1 text-xs text-[var(--app-fg-secondary)]">
          {t("themeCurrent", { mode: resolvedTheme })}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["dark", "light", "system"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`rounded-xl border px-4 py-2 text-sm transition ${
                theme === mode
                  ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "border-[var(--app-border)] text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]/30"
              }`}
            >
              {t(`theme_${mode}`)}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="destructive"
        onClick={handleLogout}
        className="mt-8 w-full"
      >
        {t("logout")}
      </Button>
    </StudentPageShell>
  );
}
