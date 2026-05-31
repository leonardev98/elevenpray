"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Building2, CalendarDays, School, Wrench } from "lucide-react";
import type { StudentProgramType } from "@/app/lib/auth-api";
import { StudentSearchableField } from "@/components/student/StudentSearchableField";
import {
  findUniversityOption,
  getCareersForUniversity,
  PERUVIAN_CAREERS,
  PERUVIAN_UNIVERSITIES,
} from "@/data/peru-student-onboarding";
import { PERUVIAN_TECHNICAL_INSTITUTES } from "@/data/peru-technical-institutes";
import {
  CYCLE_PERIOD_VALUES,
  CYCLE_YEARS,
  formatCycle,
  parseCycle,
  type CyclePeriod,
} from "@/lib/student-cycle";
import {
  normalizeStudentGradeScale,
  type StudentGradeScale,
} from "@/lib/student-grade-scale";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentGradeScaleSelect } from "./StudentGradeScaleSelect";

export type StudentStudiesFormValues = {
  programType: StudentProgramType;
  /** Nombre guardado al editar como universidad */
  institutionUniversidad: string;
  /** Nombre guardado al editar como instituto técnico */
  institutionTecnico: string;
  career: string;
  cycleYear: string;
  cyclePeriod: CyclePeriod;
  gradeScale: StudentGradeScale;
};

export function getActiveInstitution(values: StudentStudiesFormValues): string {
  return values.programType === "tecnico"
    ? values.institutionTecnico
    : values.institutionUniversidad;
}

type Props = {
  values: StudentStudiesFormValues;
  onChange: (patch: Partial<StudentStudiesFormValues>) => void;
  submitAttempted?: boolean;
};

export function StudentStudiesFields({
  values,
  onChange,
  submitAttempted = false,
}: Props) {
  const t = useTranslations("studentProfile");
  const {
    programType,
    institutionUniversidad,
    institutionTecnico,
    career,
    cycleYear,
    cyclePeriod,
    gradeScale,
  } = values;

  const activeInstitution = getActiveInstitution(values);

  const institutionOptions =
    programType === "tecnico" ? PERUVIAN_TECHNICAL_INSTITUTES : PERUVIAN_UNIVERSITIES;

  const selectedUniversity =
    programType === "universidad"
      ? findUniversityOption(institutionUniversidad)
      : undefined;

  const careerOptions = useMemo(() => {
    if (programType !== "universidad" || !institutionUniversidad.trim()) {
      return programType === "tecnico" ? PERUVIAN_CAREERS : [];
    }
    if (selectedUniversity) return getCareersForUniversity(selectedUniversity.id);
    return PERUVIAN_CAREERS;
  }, [programType, institutionUniversidad, selectedUniversity]);

  const careerFieldKey =
    programType === "universidad"
      ? selectedUniversity?.id ??
        (institutionUniversidad.trim() ? "custom-uni" : "no-uni")
      : "tecnico-career";

  const cycle = formatCycle(cycleYear, cyclePeriod);

  function periodLabel(p: CyclePeriod): string {
    if (p === "I") return t("periodSemester1");
    if (p === "II") return t("periodSemester2");
    return t("periodSummer");
  }

  const invalidInstitution = submitAttempted && !activeInstitution.trim();
  const invalidCareer = submitAttempted && !career.trim();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {t("institutionType")}
        </p>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          {t("institutionTypeHint")}
        </p>
        <div
          className="mt-2 inline-flex w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-1"
          role="group"
          aria-label={t("institutionType")}
        >
          {(
            [
              { id: "tecnico" as const, label: t("programTecnico"), icon: Wrench },
              { id: "universidad" as const, label: t("programUniversidad"), icon: School },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ programType: id })}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                programType === id
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--accent)]/25"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      <StudentSearchableField
        key={`profile-institution-${programType}`}
        id={`profile-institution-${programType}`}
        label={programType === "tecnico" ? t("instituteLabel") : t("university")}
        options={institutionOptions}
        defaultValue={
          programType === "tecnico" ? institutionTecnico : institutionUniversidad
        }
        otherItemLabel={
          programType === "tecnico" ? t("otherInstitute") : t("otherUniversity")
        }
        otherInputPlaceholder={
          programType === "tecnico"
            ? t("otherInstitutePlaceholder")
            : t("otherUniversityPlaceholder")
        }
        inputPlaceholder={
          programType === "tecnico"
            ? t("institutePlaceholder")
            : t("universityPlaceholder")
        }
        onValueChange={(v) =>
          onChange(
            programType === "tecnico"
              ? { institutionTecnico: v }
              : { institutionUniversidad: v },
          )
        }
        isInvalid={invalidInstitution}
        errorMessage={
          programType === "tecnico" ? t("instituteError") : t("universityError")
        }
        icon={<Building2 className="size-4" aria-hidden />}
      />

      <StudentSearchableField
        key={`profile-career-${careerFieldKey}`}
        id="profile-career"
        label={t("career")}
        options={careerOptions}
        defaultValue={career}
        otherItemLabel={t("otherCareer")}
        otherInputPlaceholder={t("otherCareerPlaceholder")}
        inputPlaceholder={t("careerPlaceholder")}
        disabledPlaceholder={
          programType === "universidad" ? t("careerDisabledPlaceholder") : undefined
        }
        disabled={programType === "universidad" && !institutionUniversidad.trim()}
        hint={
          programType === "universidad" && institutionUniversidad.trim()
            ? t("careerDependsOnUniversity")
            : undefined
        }
        onValueChange={(v) => onChange({ career: v })}
        isInvalid={invalidCareer}
        errorMessage={t("careerError")}
        icon={<BookOpen className="size-3.5" aria-hidden />}
      />

      <fieldset className="space-y-2 border-0 p-0">
        <legend className="flex w-full items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
          <CalendarDays className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
          {t("cycle")}
        </legend>
        <p className="text-xs text-[var(--text-muted)]">{t("cycleHint")}</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-[10px] font-medium text-[var(--text-muted)]">
              {t("cycleYear")}
            </span>
            <Select
              value={cycleYear}
              onValueChange={(v) => onChange({ cycleYear: v })}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-sm">
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
            <span className="mb-1 block text-[10px] font-medium text-[var(--text-muted)]">
              {t("cyclePeriod")}
            </span>
            <Select
              value={cyclePeriod}
              onValueChange={(v) => onChange({ cyclePeriod: v as CyclePeriod })}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-sm">
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
        <p className="text-xs text-[var(--text-muted)]">
          {t("cycleCurrent")}{" "}
          <span className="font-semibold text-[var(--accent)]">{cycle}</span>
        </p>
      </fieldset>

      <StudentGradeScaleSelect
        value={gradeScale}
        onChange={(v) => onChange({ gradeScale: v })}
      />
    </div>
  );
}

export function buildStudiesPayload(values: StudentStudiesFormValues) {
  return {
    university: getActiveInstitution(values).trim(),
    career: values.career.trim(),
    cycle: formatCycle(values.cycleYear, values.cyclePeriod),
    institutionType: values.programType,
    gradeScale: values.gradeScale,
  };
}

export function studiesValuesFromProfile(
  profile: {
    university?: string;
    career?: string;
    cycle?: string;
    institutionType?: StudentProgramType | null;
    gradeScale?: StudentGradeScale | null;
  } | null | undefined,
  defaultYear: string,
): StudentStudiesFormValues {
  const programType =
    profile?.institutionType === "tecnico" || profile?.institutionType === "universidad"
      ? profile.institutionType
      : "universidad";
  const inst = profile?.university?.trim() ?? "";
  const parsed = profile?.cycle ? parseCycle(profile.cycle) : null;
  return {
    programType,
    institutionUniversidad: programType === "universidad" ? inst : "",
    institutionTecnico: programType === "tecnico" ? inst : "",
    career: profile?.career?.trim() ?? "",
    cycleYear: parsed?.year ?? defaultYear,
    cyclePeriod: parsed?.period ?? "I",
    gradeScale: normalizeStudentGradeScale(profile?.gradeScale),
  };
}
