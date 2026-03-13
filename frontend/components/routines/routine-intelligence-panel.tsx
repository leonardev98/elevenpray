"use client";

import {
  Gauge,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Lamp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { RoutineAnalysis, RoutineSuggestion } from "@/app/lib/routine-builder";
import { Button } from "@/components/ui/button";

interface RoutineIntelligencePanelProps {
  analysis: RoutineAnalysis;
  onApplySuggestion?: (suggestion: RoutineSuggestion) => void;
}

function scoreLabelKey(score: number): string {
  if (score >= 9) return "scoreLabelExcellent";
  if (score >= 7.5) return "scoreLabelBalanced";
  if (score >= 6) return "scoreLabelGood";
  if (score >= 4) return "scoreLabelNeedsImprovement";
  return "scoreLabelWeak";
}

function insightMessageKey(id: string): string | null {
  if (id.startsWith("am-sunscreen-ok")) return "insightAmSunscreenOk";
  if (id.startsWith("am-sunscreen-miss")) return "insightAmSunscreenMiss";
  if (id.startsWith("pm-cleanser-")) return "insightPmCleanser";
  if (id.startsWith("pm-double-exfoliant")) return "insightPmDoubleExfoliant";
  if (id.startsWith("pm-retinoid-exfoliant")) return "insightPmRetinoidExfoliant";
  if (id === "tip-antioxidant-am") return "insightTipAntioxidant";
  return null;
}

function translateIngredientName(name: string, t: (key: string) => string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes("vitamin c") || lower === "vitamin c") return t("ingredientVitaminC");
  if (lower.includes("niacinamide")) return t("ingredientNiacinamide");
  if (lower.includes("retinol")) return t("ingredientRetinol");
  if (lower.includes("aha")) return t("ingredientAHA");
  if (lower.includes("bha")) return t("ingredientBHA");
  return name;
}

export function RoutineIntelligencePanel({
  analysis,
  onApplySuggestion,
}: RoutineIntelligencePanelProps) {
  const t = useTranslations("routineBuilder");
  const { score, insights, conflicts, suggestions } = analysis;
  const scorePercent = Math.round(score * 10);
  const labelKey = scoreLabelKey(score);

  const cardBase =
    "flex min-h-[180px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm";

  return (
    <section
      className="pb-16"
      aria-labelledby="routine-intelligence-heading"
    >
      <h2
        id="routine-intelligence-heading"
        className="mb-4 text-lg font-semibold tracking-normal text-[var(--app-fg-title)]"
      >
        {t("intelligenceTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Routine Health Score */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
            <Gauge className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            {t("intelligenceScore")}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums text-[var(--app-fg)]">
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-[var(--app-fg)]/50">/ 10</span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--app-fg)]/70">{t(labelKey)}</p>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-fg)]/10"
            role="progressbar"
            aria-valuenow={scorePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* 2. Smart Insights */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
            <Lightbulb className="size-4 text-amber-500 dark:text-amber-400" aria-hidden />
            {t("intelligenceInsights")}
          </div>
          {insights.length === 0 ? (
            <p className="mt-3 flex-1 text-sm text-[var(--app-fg)]/60">{t("insightsBalanced")}</p>
          ) : (
            <ul className="mt-2 space-y-1.5 overflow-y-auto">
              {insights.map((insight) => {
                const messageKey = insightMessageKey(insight.id);
                const message = messageKey ? t(messageKey) : insight.message;
                return (
                  <li
                    key={insight.id}
                    className="flex items-start gap-2 rounded-md bg-[var(--app-bg)]/50 px-2 py-1.5"
                  >
                    {insight.severity === "info" && (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    )}
                    {insight.severity === "warning" && (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    )}
                    {insight.severity === "tip" && (
                      <Lamp className="mt-0.5 size-3.5 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden />
                    )}
                    <span className="text-xs leading-snug text-[var(--app-fg)]/90">{message}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 3. Ingredient Conflicts */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
            <FlaskConical className="size-4 text-rose-500 dark:text-rose-400" aria-hidden />
            {t("intelligenceConflicts")}
          </div>
          {conflicts.length === 0 ? (
            <p className="mt-3 flex-1 text-sm text-[var(--app-fg)]/60">{t("intelligenceNoConflicts")}</p>
          ) : (
            <ul className="mt-2 space-y-2 overflow-y-auto">
              {conflicts.map((c, index) => {
                const nameA = translateIngredientName(c.ingredientA, t);
                const nameB = translateIngredientName(c.ingredientB, t);
                const useTranslatedMessage =
                  /high concentration|redness|different times|stable formulation/i.test(c.message);
                const conflictMessage = useTranslatedMessage
                  ? t("conflictMessageHighConcentrations")
                  : c.message;
                return (
                  <li
                    key={`${c.ingredientA}-${c.ingredientB}-${index}`}
                    className="rounded-lg border border-rose-200/60 bg-rose-50/50 p-2 dark:border-rose-900/40 dark:bg-rose-950/30"
                  >
                    <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                      {nameA} + {nameB}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-[var(--app-fg)]/80">{conflictMessage}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 4. Optimization Suggestions */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
            <Sparkles className="size-4 text-violet-500 dark:text-violet-400" aria-hidden />
            {t("intelligenceSuggestions")}
          </div>
          {suggestions.length === 0 ? (
            <p className="mt-3 flex-1 text-sm text-[var(--app-fg)]/60">{t("intelligenceNoSuggestions")}</p>
          ) : (
            <ul className="mt-2 space-y-2 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="flex flex-col gap-1.5 rounded-lg bg-[var(--app-bg)]/50 px-2 py-2"
                >
                  <span className="text-xs leading-snug text-[var(--app-fg)]/90">{suggestion.message}</span>
                  {suggestion.action && onApplySuggestion && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion)}
                      className="h-7 w-fit text-xs"
                    >
                      {t("intelligenceApply")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
