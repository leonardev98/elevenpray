"use client";

import { useTranslations } from "next-intl";
import { Brain, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_FREE_USAGE, PLAN_LIMITS } from "../lib/plans";

type UsageRowProps = {
  icon: typeof Brain;
  label: string;
  used: number;
  max: number;
};

function UsageRow({ icon: Icon, label, used, max }: UsageRowProps) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  const atLimit = used >= max;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 text-[var(--app-fg-secondary)]">
          <Icon className="size-4 shrink-0 text-[var(--app-primary)]" aria-hidden />
          {label}
        </span>
        <span
          className={
            atLimit
              ? "font-medium text-amber-400"
              : "text-[var(--app-fg-muted)]"
          }
        >
          {used} / {max}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--app-bg)]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit ? "bg-amber-500" : "bg-[var(--app-primary)]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlanUsageCard() {
  const t = useTranslations("studentPlan");
  const limits = PLAN_LIMITS.free;

  return (
    <div className="student-card border-dashed border-[var(--app-primary)]/25 p-5">
      <p className="text-sm font-medium text-[var(--app-fg)]">{t("usageTitle")}</p>
      <p className="mt-1 text-xs text-[var(--app-fg-secondary)]">{t("usageSubtitle")}</p>
      <div className="mt-5 space-y-4">
        {limits.quizzesPerMonth != null && (
          <UsageRow
            icon={Zap}
            label={t("usageQuizzes")}
            used={MOCK_FREE_USAGE.quizzesUsed}
            max={limits.quizzesPerMonth}
          />
        )}
        {limits.flashcardsPerCourse != null && (
          <UsageRow
            icon={Layers}
            label={t("usageFlashcards")}
            used={MOCK_FREE_USAGE.flashcardsUsed}
            max={limits.flashcardsPerCourse}
          />
        )}
        {limits.aiCreditsPerMonth != null && (
          <UsageRow
            icon={Brain}
            label={t("usageAi")}
            used={MOCK_FREE_USAGE.aiCreditsUsed}
            max={limits.aiCreditsPerMonth}
          />
        )}
      </div>
    </div>
  );
}
