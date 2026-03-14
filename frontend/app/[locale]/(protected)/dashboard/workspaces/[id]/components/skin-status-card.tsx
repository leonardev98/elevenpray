"use client";

import { useTranslations } from "next-intl";
import {
  parseSkinProfileFromPreference,
  type SkinProfileAnswers,
} from "./skin-profile-onboarding";

interface SkinStatusCardProps {
  profile: SkinProfileAnswers | null;
  lastUpdated?: string | null;
}

function formatLastUpdate(dateStr: string, t: (key: string, values?: Record<string, number>) => string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return t("lastUpdateToday");
  return t("daysAgo", { days });
}

const SKIN_TYPE_LABELS: Record<string, string> = {
  oily: "skinTypeOily",
  dry: "skinTypeDry",
  combination: "skinTypeCombination",
  sensitive: "skinTypeSensitive",
  acne_prone: "skinTypeAcneProne",
};

const SENSITIVITY_LABELS: Record<string, string> = {
  low: "sensitivityLow",
  medium: "sensitivityMedium",
  high: "sensitivityHigh",
};

/** Claves de traducción para preocupaciones (mainConcerns). */
const CONCERN_LABEL_KEYS: Record<string, string> = {
  acne: "concernAcne",
  wrinkles: "concernWrinkles",
  dark_circles: "concernDarkCircles",
  hyperpigmentation: "concernHyperpigmentation",
  hydration: "concernHydration",
  redness: "concernRedness",
  large_pores: "concernLargePores",
  sun_damage: "concernSunDamage",
};

const VALID_SKIN_TYPE_KEYS = new Set<string>(Object.values(SKIN_TYPE_LABELS));
const VALID_SENSITIVITY_KEYS = new Set<string>(Object.values(SENSITIVITY_LABELS));

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  if (!key) return fallback;
  const isKnownKey = VALID_SKIN_TYPE_KEYS.has(key) || VALID_SENSITIVITY_KEYS.has(key);
  if (!isKnownKey) return fallback;
  try {
    const out = t(key);
    return typeof out === "string" && out ? out : fallback;
  } catch {
    return fallback;
  }
}

function formatConcernLabel(t: (key: string) => string, concernKey: string): string {
  const labelKey = CONCERN_LABEL_KEYS[concernKey];
  if (!labelKey) return concernKey;
  try {
    const out = t(labelKey);
    return typeof out === "string" && out ? out : concernKey;
  } catch {
    return concernKey;
  }
}

export function SkinStatusCard({ profile, lastUpdated }: SkinStatusCardProps) {
  const t = useTranslations("workspaceNav");

  if (!profile) {
    return (
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
        aria-labelledby="skin-status-heading"
      >
        <h2
          id="skin-status-heading"
          className="mb-3 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
        >
          {t("skinStatus")}
        </h2>
        <p className="text-xs text-[var(--app-fg)]/70 dark:text-slate-400">{t("noProfileYet")}</p>
      </section>
    );
  }

  const skinTypeKey = SKIN_TYPE_LABELS[profile.skinType] ?? profile.skinType;
  const sensitivityKey = SENSITIVITY_LABELS[profile.sensitivityLevel] ?? profile.sensitivityLevel;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
      aria-labelledby="skin-status-heading"
    >
      <h2
        id="skin-status-heading"
        className="mb-3 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        {t("skinStatus")}
      </h2>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--app-fg)]/70 dark:text-slate-400">{t("skinTypeLabel")}</dt>
          <dd className="font-medium text-[var(--app-fg)] dark:text-zinc-200">
            {safeT(t, skinTypeKey, profile.skinType || "—")}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--app-fg)]/70 dark:text-slate-400">{t("sensitivityLabel")}</dt>
          <dd className="font-medium text-[var(--app-fg)] dark:text-zinc-200">
            {safeT(t, sensitivityKey, profile.sensitivityLevel || "—")}
          </dd>
        </div>
        {profile.mainConcerns?.length ? (
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--app-fg)]/70 dark:text-slate-400">{t("concernsLabel")}</dt>
            <dd className="text-right font-medium text-[var(--app-fg)] dark:text-zinc-200">
              {profile.mainConcerns
                .slice(0, 3)
                .map((key) => formatConcernLabel(t, key))
                .join(", ")}
            </dd>
          </div>
        ) : null}
      </dl>
      {lastUpdated && (
        <p className="mt-3 text-xs text-[var(--app-fg)]/60 dark:text-slate-500">
          {t("lastUpdate")} {formatLastUpdate(lastUpdated, t)}
        </p>
      )}
    </section>
  );
}
