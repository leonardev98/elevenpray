"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Building2, CalendarDays, GraduationCap, Sparkles, User } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { saveStudentProfile } from "../app/lib/student-storage";
import { cn } from "@/lib/utils";
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

  const invalidName = submitAttempted && !name.trim();
  const invalidUniversity = submitAttempted && !university.trim();
  const invalidCareer = submitAttempted && !career.trim();

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--app-primary)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--app-primary)]/10 blur-3xl"
      />

      <div className="relative w-full max-w-xl">
        <header className="mb-8 text-center sm:mb-10">
          {firstName && (
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-xs font-medium text-[var(--app-fg-secondary)] shadow-sm">
              <Sparkles className="size-3.5 text-[var(--app-primary)]" aria-hidden />
              {t("welcomeBack", { name: firstName })}
            </span>
          )}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-hover)] text-[var(--app-white)] shadow-lg shadow-[var(--app-primary)]/25">
            <GraduationCap className="size-8" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--app-fg)] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--app-fg-secondary)] sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="student-card space-y-7 p-6 shadow-xl shadow-black/5 sm:p-8"
          noValidate
        >
          <section className="space-y-4">
            <SectionTitle icon={<User className="size-4" />} title={t("sectionPersonal")} />

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-[var(--app-fg)]"
              >
                {t("name")}
              </label>
              <div
                className={cn(
                  "flex items-center overflow-hidden rounded-xl border bg-[var(--app-surface)] shadow-sm transition-colors",
                  invalidName
                    ? "border-red-500/60 focus-within:ring-2 focus-within:ring-red-500/20"
                    : "border-[var(--app-border)] focus-within:border-[var(--app-primary)]/50 focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20",
                )}
              >
                <div className="flex shrink-0 items-center justify-center pl-3 text-[var(--app-fg-muted)]">
                  <User className="size-4" aria-hidden />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  className="w-full bg-transparent px-3 py-3 text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] outline-none"
                  placeholder={t("namePlaceholder")}
                  aria-invalid={invalidName || undefined}
                />
              </div>
              {invalidName && (
                <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
                  {t("nameError")}
                </p>
              )}
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-[var(--app-border)] to-transparent" />

          <section className="space-y-5">
            <SectionTitle icon={<GraduationCap className="size-4" />} title={t("sectionAcademic")} />

            <StudentSearchableField
              id="university"
              label={t("university")}
              options={PERUVIAN_UNIVERSITIES}
              otherItemLabel={t("otherUniversity")}
              otherInputPlaceholder={t("otherUniversityPlaceholder")}
              inputPlaceholder={t("universityPlaceholder")}
              onValueChange={setUniversity}
              isInvalid={invalidUniversity}
              errorMessage={t("universityError")}
              icon={<Building2 className="size-4" aria-hidden />}
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
              errorMessage={t("careerError")}
              icon={<BookOpen className="size-4" aria-hidden />}
            />

            <fieldset className="space-y-2 border-0 p-0">
              <legend className="flex w-full items-center gap-2 text-sm font-medium text-[var(--app-fg)]">
                <CalendarDays className="size-4 text-[var(--app-fg-muted)]" aria-hidden />
                {t("cycle")}
              </legend>
              <p className="text-xs text-[var(--app-fg-secondary)]">{t("cycleHint")}</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-1 block text-xs font-medium text-[var(--app-fg-secondary)]">
                    {t("cycleYear")}
                  </span>
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
                  <span className="mb-1 block text-xs font-medium text-[var(--app-fg-secondary)]">
                    {t("cyclePeriod")}
                  </span>
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
              <div
                className="mt-1.5 flex items-center gap-2 rounded-lg bg-[var(--app-surface-soft)] px-3 py-2 text-xs text-[var(--app-fg-secondary)]"
                aria-live="polite"
              >
                <span className="font-medium text-[var(--app-fg-muted)]">{t("cycleCurrent")}</span>
                <span className="rounded-md bg-[var(--app-primary-soft)] px-2 py-0.5 font-semibold text-[var(--app-primary)]">
                  {cycle}
                </span>
              </div>
            </fieldset>
          </section>

          <div className="space-y-3 pt-2">
            <Button
              type="submit"
              className="group h-12 w-full rounded-xl bg-[var(--app-primary)] text-base font-semibold text-[var(--app-white)] shadow-lg shadow-[var(--app-primary)]/25 transition-all hover:bg-[var(--app-primary-hover)] hover:shadow-xl hover:shadow-[var(--app-primary)]/30 active:translate-y-px"
            >
              <span className="flex items-center justify-center gap-2">
                {t("submit")}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Button>
            <p className="text-center text-xs text-[var(--app-fg-muted)]">
              {t("editLater")}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--app-fg-secondary)]">
        {title}
      </h2>
    </div>
  );
}
