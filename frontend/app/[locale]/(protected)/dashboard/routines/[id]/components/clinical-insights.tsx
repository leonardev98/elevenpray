"use client";

import { useTranslations } from "next-intl";
import type { RoutineInsight } from "@/app/lib/routine-builder";

interface ClinicalInsightsProps {
  insights: RoutineInsight[];
}

const INSIGHT_I18N_KEYS: Record<string, string> = {
  "am-sunscreen": "insights.amSunscreen",
  "pm-cleanser": "insights.pmCleanser",
};

export function ClinicalInsights({ insights }: ClinicalInsightsProps) {
  const t = useTranslations("routineBuilder");

  if (!insights.length) {
    return (
      <section>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/55">
          {t("clinicalInsightsTitle")}
        </h3>
        <p className="mb-1 text-sm text-[var(--app-fg)]/65">{t("clinicalInsightsDescription")}</p>
        <p className="text-sm text-[var(--app-fg)]/70">{t("insightsBalanced")}</p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/55">
        {t("clinicalInsightsTitle")}
      </h3>
      <p className="mb-2 text-sm text-[var(--app-fg)]/65">{t("clinicalInsightsDescription")}</p>
      <ul className="space-y-1.5">
        {insights.map((insight, index) => {
          const i18nKey = INSIGHT_I18N_KEYS[insight.id];
          const message = i18nKey ? t(i18nKey) : insight.message;
          return (
            <li
              key={`${insight.id}-${index}`}
              className="text-sm text-[var(--app-fg)]/80"
            >
              {message}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
