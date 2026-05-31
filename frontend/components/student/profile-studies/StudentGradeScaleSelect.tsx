"use client";

import { useTranslations } from "next-intl";
import type { StudentGradeScale } from "@/lib/student-grade-scale";
import { STUDENT_GRADE_SCALE_VALUES } from "@/lib/student-grade-scale";
import { cn } from "@/lib/utils";

type Props = {
  value: StudentGradeScale;
  onChange: (value: StudentGradeScale) => void;
  id?: string;
};

export function StudentGradeScaleSelect({ value, onChange, id = "grade-scale" }: Props) {
  const t = useTranslations("studentProfile");

  return (
    <fieldset className="border-0 p-0">
      <legend className="text-sm font-medium text-[var(--text-primary)]">
        {t("gradeScale")}
      </legend>
      <div
        id={id}
        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label={t("gradeScale")}
      >
        {STUDENT_GRADE_SCALE_VALUES.map((scale) => (
          <label
            key={scale}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-xl border-[0.5px] px-3 py-2.5 text-xs font-medium transition",
              value === scale
                ? "border-[var(--accent)]/50 bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]",
            )}
          >
            <input
              type="radio"
              name={id}
              value={scale}
              checked={value === scale}
              onChange={() => onChange(scale)}
              className="sr-only"
            />
            {t(`gradeScale_${scale}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
