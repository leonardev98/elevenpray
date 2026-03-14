"use client";

import { motion } from "framer-motion";
import {
  Gauge,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Lamp,
  Flame,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { RoutineAnalysis, RoutineSuggestion } from "@/app/lib/routine-builder";
import type { RoutineIntelligenceResult, SuggestedAction } from "@/app/lib/routine-builder";
import { Button } from "@/components/ui/button";

interface RoutineIntelligencePanelProps {
  analysis: RoutineAnalysis;
  routineIntelligence?: RoutineIntelligenceResult | null;
  onApplySuggestion?: (suggestion: RoutineSuggestion) => void;
}

function scoreLabelKey(score: number): string {
  if (score >= 9) return "scoreLabelExcellent";
  if (score >= 7.5) return "scoreLabelBalanced";
  if (score >= 6) return "scoreLabelGood";
  if (score >= 4) return "scoreLabelNeedsImprovement";
  return "scoreLabelWeak";
}

const GENERAL_TIP_KEYS = ["tipCleanse30Sec", "tipSerumDampSkin", "tipSunscreenReapply"] as const;

function insightMessageKey(id: string): string | null {
  if (id.startsWith("am-sunscreen-ok")) return "insightAmSunscreenOk";
  if (id.startsWith("pm-cleanser-")) return "insightPmCleanser";
  if (id.startsWith("pm-double-exfoliant")) return "insightPmDoubleExfoliant";
  if (id.startsWith("pm-retinoid-exfoliant")) return "insightPmRetinoidExfoliant";
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

/** Safe translate: returns fallback if key is missing (avoids MISSING_MESSAGE throw). */
function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const out = t(key);
    return typeof out === "string" && out ? out : fallback;
  } catch {
    return fallback;
  }
}

function buildSuggestionFromIntelligenceAction(action: SuggestedAction): RoutineSuggestion | null {
  if (action.type === "remove_item" && action.itemId != null && action.dayKey != null && action.slot != null) {
    return {
      id: `intel-remove-${action.itemId}`,
      message: "",
      action: { type: "remove_item", dayKey: action.dayKey, slot: action.slot, itemId: action.itemId },
    };
  }
  if (
    action.type === "move_item" &&
    action.itemId != null &&
    action.dayKey != null &&
    action.slot != null &&
    action.toDayKey != null &&
    action.toSlot != null
  ) {
    return {
      id: `intel-move-${action.itemId}`,
      message: "",
      action: {
        type: "move_item",
        dayKey: action.dayKey,
        slot: action.slot,
        itemId: action.itemId,
        toDayKey: action.toDayKey,
        toSlot: action.toSlot,
      },
    };
  }
  if (action.type === "open_add_product" && action.slot != null && action.dayKey != null) {
    return {
      id: `intel-add-${action.suggestedStepType ?? "product"}`,
      message: "",
      action: {
        type: "open_add_product",
        slot: action.slot,
        suggestedStepType: action.suggestedStepType as "cleanser" | "serum" | "sunscreen" | undefined,
        dayKeys: [action.dayKey],
      },
    };
  }
  return null;
}

export function RoutineIntelligencePanel({
  analysis,
  routineIntelligence,
  onApplySuggestion,
}: RoutineIntelligencePanelProps) {
  const t = useTranslations("routineBuilder");
  const tDays = useTranslations("days");
  const { score, insights, conflicts, suggestions } = analysis;
  const scorePercent = Math.round(score * 10);
  const labelKey = scoreLabelKey(score);

  const cardBase =
    "flex min-h-[180px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm";

  return (
    <motion.section
      className="pb-16"
      aria-labelledby="routine-intelligence-heading"
      layout
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
          {insights.length === 0 && (
            <p className="mt-3 text-sm text-[var(--app-fg)]/60">{t("insightsBalanced")}</p>
          )}
          {insights.length > 0 ? (
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
                    <span className="text-xs leading-snug text-[var(--app-fg)]/90">{message}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <ul className={insights.length > 0 ? "mt-2 space-y-1.5" : "mt-3 space-y-1.5"}>
            {GENERAL_TIP_KEYS.slice(0, 2).map((key) => (
              <li
                key={key}
                className="flex items-start gap-2 rounded-md bg-[var(--app-bg)]/50 px-2 py-1.5"
              >
                <Lamp className="mt-0.5 size-3.5 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden />
                <span className="text-xs leading-snug text-[var(--app-fg)]/90">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Routine Intelligence: Warnings, Conflicts, Recommendations */}
        <div className={cardBase}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/70">
            <FlaskConical className="size-4 text-rose-500 dark:text-rose-400" aria-hidden />
            {t("intelligenceConflicts")}
          </div>
          {routineIntelligence &&
          (routineIntelligence.warnings.length > 0 ||
            routineIntelligence.conflicts.length > 0 ||
            routineIntelligence.recommendations.length > 0) ? (
            <ul className="mt-2 max-h-[280px] space-y-2 overflow-y-auto pr-0.5">
              {routineIntelligence.warnings.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-2 dark:border-amber-900/40 dark:bg-amber-950/30"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        {issue.messageKey ? safeT(t, issue.messageKey, issue.message ?? "Two products of the same step may not be necessary.") : (issue.message ?? "")}
                      </p>
                      {issue.type === "duplicate_function" &&
                        (issue.contextDayKey != null || issue.contextProductNames?.length) && (
                        <p className="mt-1 text-xs leading-snug text-amber-700/90 dark:text-amber-300/90">
                          {[
                            issue.contextDayKey != null && issue.contextSlot != null
                              ? `${tDays(issue.contextDayKey)}, ${issue.contextSlot === "am" ? t("morning") : t("night")}`
                              : null,
                            issue.contextStepType
                              ? safeT(t, `stepTypes.${issue.contextStepType}` as Parameters<typeof t>[0], issue.contextStepType)
                              : null,
                            issue.contextProductNames?.length
                              ? issue.contextProductNames.join(", ")
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                      )}
                      {issue.suggestedActions && issue.suggestedActions.length > 0 && onApplySuggestion && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {issue.suggestedActions.map((action, idx) => {
                            const suggestion = buildSuggestionFromIntelligenceAction(action);
                            if (!suggestion) return null;
                            return (
                              <Button
                                key={idx}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 border-amber-300 text-xs dark:border-amber-700"
                                onClick={() => onApplySuggestion(suggestion)}
                              >
                                {safeT(t, action.labelKey, action.labelKey)}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {routineIntelligence.conflicts.map((issue) => {
                const labelA = issue.ingredientA != null ? translateIngredientName(issue.ingredientA, t) : "";
                const labelB = issue.ingredientB != null ? translateIngredientName(issue.ingredientB, t) : "";
                return (
                  <li
                    key={issue.id}
                    className="rounded-lg border border-rose-200/60 bg-rose-50/50 p-2 dark:border-rose-900/40 dark:bg-rose-950/30"
                  >
                    <div className="flex items-start gap-2">
                      <Flame className="mt-0.5 size-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
                      <div className="min-w-0 flex-1">
                        {issue.ingredientA != null && issue.ingredientB != null && (
                          <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                            {labelA} + {labelB}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs leading-snug text-[var(--app-fg)]/80">
                          {issue.messageKey ? safeT(t, issue.messageKey, issue.message ?? "") : (issue.message ?? "")}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-rose-700/90 dark:text-rose-300/90">
                          {safeT(t, "conflictIntro", "Below: day, moment, and which product contributes each ingredient.")}
                        </p>
                        {issue.conflictOccurrences && issue.conflictOccurrences.length > 0 && (
                          <div className="mt-2 space-y-2 border-t border-rose-200/50 pt-2 dark:border-rose-800/40">
                            {issue.conflictOccurrences.map((occ, idx) => {
                              const actionForOccurrence =
                                issue.suggestedActions?.find(
                                  (ac) => ac.dayKey === occ.dayKey && ac.slot === occ.slot
                                );
                              const withA = occ.productDetails?.filter((pd) => pd.ingredient === "A").map((pd) => pd.name) ?? [];
                              const withB = occ.productDetails?.filter((pd) => pd.ingredient === "B").map((pd) => pd.name) ?? [];
                              const hasWhoHas = labelA && labelB && (withA.length > 0 || withB.length > 0);
                              return (
                                <div
                                  key={idx}
                                  className="rounded-md border border-rose-200/50 bg-white/50 px-2 py-1.5 dark:border-rose-800/30 dark:bg-rose-950/20"
                                >
                                  <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                                    {tDays(occ.dayKey)}, {occ.slot === "am" ? t("morning") : t("night")}
                                  </p>
                                  {hasWhoHas ? (
                                    <div className="mt-1 space-y-0.5 text-xs leading-snug text-rose-700 dark:text-rose-300">
                                      {withA.length > 0 && (
                                        <p><span className="font-medium">{labelA}:</span> {withA.join(", ")}</p>
                                      )}
                                      {withB.length > 0 && (
                                        <p><span className="font-medium">{labelB}:</span> {withB.join(", ")}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="mt-0.5 text-xs leading-snug text-rose-700 dark:text-rose-300">
                                      {occ.productNames.join(", ")}
                                    </p>
                                  )}
                                  {actionForOccurrence && onApplySuggestion && (
                                    <div className="mt-1.5">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 border-rose-300 text-xs dark:border-rose-700"
                                        onClick={() => {
                                          const suggestion = buildSuggestionFromIntelligenceAction(actionForOccurrence);
                                          if (suggestion) onApplySuggestion(suggestion);
                                        }}
                                      >
                                        {safeT(t, actionForOccurrence.labelKey, actionForOccurrence.labelKey)}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {routineIntelligence.recommendations.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-lg border border-violet-200/60 bg-violet-50/50 p-2 dark:border-violet-900/40 dark:bg-violet-950/30"
                >
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-violet-800 dark:text-violet-200">
                        {issue.messageKey ? safeT(t, issue.messageKey, issue.message ?? "SPF is recommended to finish a morning routine.") : (issue.message ?? "")}
                      </p>
                      {issue.suggestedActions && issue.suggestedActions.length > 0 && onApplySuggestion && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {issue.suggestedActions.map((action, idx) => {
                            const suggestion = buildSuggestionFromIntelligenceAction(action);
                            if (!suggestion) return null;
                            return (
                              <Button
                                key={idx}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 border-violet-300 text-xs dark:border-violet-700"
                                onClick={() => onApplySuggestion(suggestion)}
                              >
                                {safeT(t, action.labelKey, action.labelKey)}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : conflicts.length === 0 ? (
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
                  <span className="text-xs leading-snug text-[var(--app-fg)]/90">
                    {suggestion.messageKey ? t(suggestion.messageKey) : suggestion.message}
                  </span>
                  {suggestion.action && onApplySuggestion && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion)}
                      className="h-7 w-fit text-xs"
                    >
                      {suggestion.action.type === "open_add_product"
                        ? t("suggestionAddProductCta")
                        : t("intelligenceApply")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.section>
  );
}
