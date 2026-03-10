"use client";

import { useTranslations } from "next-intl";
import type { RoutineComplexity, SkinType } from "@/app/lib/routines-api";

interface SkinProfileSelectorProps {
  skinType?: SkinType;
  complexity?: RoutineComplexity;
  goals: string[];
  onChange: (value: {
    skinType?: SkinType;
    complexity?: RoutineComplexity;
    goals: string[];
  }) => void;
}

const GOAL_OPTIONS = [
  "acne control",
  "glow",
  "hydration",
  "anti-aging",
  "dark spots",
  "barrier repair",
  "texture improvement",
] as const;

const SKIN_TYPES: SkinType[] = ["oily", "dry", "combination", "sensitive", "acne-prone"];
const COMPLEXITY_OPTIONS: (RoutineComplexity | "")[] = ["", "minimal", "balanced", "advanced"];

export function SkinProfileSelector({
  skinType,
  complexity,
  goals,
  onChange,
}: SkinProfileSelectorProps) {
  const t = useTranslations("routineBuilder");

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-fg)]/55">{t("skinType")}</span>
        <select
          value={skinType ?? ""}
          onChange={(event) =>
            onChange({
              skinType: (event.target.value || undefined) as SkinType | undefined,
              complexity,
              goals,
            })
          }
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
        >
          <option value="">{t("notSet")}</option>
          {SKIN_TYPES.map((value) => (
            <option key={value} value={value}>
              {t(`skinTypes.${value}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-fg)]/55">{t("complexity")}</span>
        <select
          value={complexity ?? ""}
          onChange={(event) =>
            onChange({
              skinType,
              complexity: (event.target.value || undefined) as RoutineComplexity | undefined,
              goals,
            })
          }
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
        >
          <option value="">{t("complexityOptions.balanced")}</option>
          <option value="minimal">{t("complexityOptions.minimal")}</option>
          <option value="balanced">{t("complexityOptions.balanced")}</option>
          <option value="advanced">{t("complexityOptions.advanced")}</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-fg)]/55">{t("primaryGoal")}</span>
        <select
          value={goals[0] ?? ""}
          onChange={(event) =>
            onChange({
              skinType,
              complexity,
              goals: event.target.value ? [event.target.value] : [],
            })
          }
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
        >
          <option value="">{t("selectGoal")}</option>
          {GOAL_OPTIONS.map((goal) => (
            <option key={goal} value={goal}>
              {t(`goals.${goal}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
