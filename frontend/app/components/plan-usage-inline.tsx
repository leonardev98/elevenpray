"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MOCK_FREE_USAGE, PLAN_LIMITS } from "../lib/plans";

type MiniBarProps = { label: string; used: number; max: number };

function MiniBar({ label, used, max }: MiniBarProps) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="min-w-[120px] flex-1">
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--app-fg-secondary)]">
        <span>{label}</span>
        <span className="shrink-0 tabular-nums font-medium text-[var(--app-fg)]">
          {used}/{max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--app-bg)]">
        <div
          className={cn(
            "h-full rounded-full bg-[var(--app-primary)] transition-all",
            used >= max && "bg-amber-500/90"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlanUsageInline() {
  const t = useTranslations("studentPlan");
  const limits = PLAN_LIMITS.free;

  return (
    <div className="flex w-full flex-wrap gap-5 border-t border-[var(--app-border)] pt-4 lg:w-auto lg:min-w-[420px] lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
      {limits.quizzesPerMonth != null && (
        <MiniBar
          label={t("usageQuizzes")}
          used={MOCK_FREE_USAGE.quizzesUsed}
          max={limits.quizzesPerMonth}
        />
      )}
      {limits.flashcardsPerCourse != null && (
        <MiniBar
          label={t("usageFlashcards")}
          used={MOCK_FREE_USAGE.flashcardsUsed}
          max={limits.flashcardsPerCourse}
        />
      )}
      {limits.aiCreditsPerMonth != null && (
        <MiniBar
          label={t("usageAi")}
          used={MOCK_FREE_USAGE.aiCreditsUsed}
          max={limits.aiCreditsPerMonth}
        />
      )}
    </div>
  );
}
