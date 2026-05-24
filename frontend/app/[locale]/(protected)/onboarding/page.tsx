"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { saveStudentProfile } from "../app/lib/student-storage";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSearchableField } from "@/components/student/StudentSearchableField";
import { PERUVIAN_CAREERS, PERUVIAN_UNIVERSITIES } from "@/data/peru-student-onboarding";

const CYCLE_YEARS = [2024, 2025, 2026, 2027, 2028] as const;
const CYCLE_PERIOD_VALUES = ["I", "II", "Verano"] as const;
type CyclePeriod = (typeof CYCLE_PERIOD_VALUES)[number];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboardingStudent");
  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState("");
  const [career, setCareer] = useState("");
  const defaultYear = useMemo(() => String(new Date().getFullYear()), []);
  const [cycleYear, setCycleYear] = useState(defaultYear);
  const [cyclePeriod, setCyclePeriod] = useState<CyclePeriod>("I");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const cycle = `${cycleYear}-${cyclePeriod}`;

  function periodLabel(p: CyclePeriod): string {
    if (p === "I") return t("periodSemester1");
    if (p === "II") return t("periodSemester2");
    return t("periodSummer");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!name.trim() || !university.trim() || !career.trim() || !cycleYear || !cyclePeriod) return;
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

  const invalidUniversity = submitAttempted && !university.trim();
  const invalidCareer = submitAttempted && !career.trim();

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

        <form onSubmit={handleSubmit} className="student-card space-y-5 p-6">
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
              maxLength={80}
              className={inputClass}
              placeholder={t("namePlaceholder")}
            />
          </div>

          <StudentSearchableField
            id="university"
            label={t("university")}
            options={PERUVIAN_UNIVERSITIES}
            otherItemLabel={t("otherUniversity")}
            otherInputPlaceholder={t("otherUniversityPlaceholder")}
            inputPlaceholder={t("universityPlaceholder")}
            onValueChange={setUniversity}
            isInvalid={invalidUniversity}
          />

          <StudentSearchableField
            id="career"
            label={t("career")}
            options={PERUVIAN_CAREERS}
            otherItemLabel={t("otherCareer")}
            otherInputPlaceholder={t("otherCareerPlaceholder")}
            inputPlaceholder={t("careerPlaceholder")}
            onValueChange={setCareer}
            isInvalid={invalidCareer}
          />

          <fieldset className="space-y-2 border-0 p-0">
            <legend className="block w-full text-sm font-medium text-[var(--app-fg)]">{t("cycle")}</legend>
            <p className="text-xs text-[var(--app-fg-secondary)]">{t("cycleHint")}</p>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1 block text-xs font-medium text-[var(--app-fg-secondary)]">{t("cycleYear")}</span>
                <Select value={cycleYear} onValueChange={setCycleYear}>
                  <SelectTrigger className="h-12 w-full rounded-xl border-[var(--app-border)] bg-[var(--app-surface)] focus:border-[var(--app-primary)]/50 focus:ring-[var(--app-primary)]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-[var(--app-fg-secondary)]">{t("cyclePeriod")}</span>
                <Select value={cyclePeriod} onValueChange={(v) => setCyclePeriod(v as CyclePeriod)}>
                  <SelectTrigger className="h-12 w-full rounded-xl border-[var(--app-border)] bg-[var(--app-surface)] focus:border-[var(--app-primary)]/50 focus:ring-[var(--app-primary)]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLE_PERIOD_VALUES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {periodLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-[var(--app-fg-muted)]" aria-live="polite">
              {cycle}
            </p>
          </fieldset>

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
