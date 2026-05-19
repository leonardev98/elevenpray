"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { saveStudentProfile } from "../app/lib/student-storage";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboardingStudent");
  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState("");
  const [career, setCareer] = useState("");
  const [cycle, setCycle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !university.trim() || !career.trim() || !cycle.trim()) return;
    saveStudentProfile({
      name: name.trim(),
      university: university.trim(),
      career: career.trim(),
      cycle: cycle.trim(),
    });
    router.push("/app");
    router.refresh();
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-2xl font-bold text-[var(--app-primary)]">
            M
          </div>
          <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--app-fg-secondary)]">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="student-card space-y-4 p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--app-fg)]">
              {t("name")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder={t("namePlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-[var(--app-fg)]">
              {t("university")}
            </label>
            <input
              id="university"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
              className={inputClass}
              placeholder={t("universityPlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-[var(--app-fg)]">
              {t("career")}
            </label>
            <input
              id="career"
              type="text"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              required
              className={inputClass}
              placeholder={t("careerPlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="cycle" className="block text-sm font-medium text-[var(--app-fg)]">
              {t("cycle")}
            </label>
            <input
              id="cycle"
              type="text"
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
              required
              className={inputClass}
              placeholder={t("cyclePlaceholder")}
            />
          </div>
          <Button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[var(--app-primary)] py-6 text-[var(--app-bg)] hover:bg-[var(--app-primary-hover)]"
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
