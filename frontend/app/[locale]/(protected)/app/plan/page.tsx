"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { DashboardPlansPicker } from "@/app/components/dashboard-plans-picker";
import { PlanUsageInline } from "@/app/components/plan-usage-inline";
import { getEffectiveUserPlan } from "@/app/lib/user-plan";
import type { PlanId } from "@/app/lib/plans";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentPlanPage() {
  const t = useTranslations("studentPlan");
  const tPricing = useTranslations("pricing");
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>(() =>
    getEffectiveUserPlan().planId
  );

  const planName = tPricing(`plans.${currentPlanId}.name`);

  return (
    <StudentPageShell title={t("title")} maxWidth="max-w-7xl">
      <div className="flex min-h-[calc(100dvh-7.5rem)] flex-col gap-5">
        <div className="student-card shrink-0 p-5 lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <GraduationCap className="size-7" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg-muted)]">
                  {t("currentLabel")}
                </p>
                <p className="mt-0.5 text-2xl font-bold text-[var(--app-fg)]">{planName}</p>
                <p className="mt-1 text-sm text-[var(--app-fg-secondary)]">
                  {currentPlanId === "free"
                    ? t("freeDescription")
                    : currentPlanId === "plus"
                      ? t("plusDescription")
                      : t("proDescription")}
                </p>
              </div>
            </div>
            {currentPlanId === "free" && <PlanUsageInline />}
          </div>
        </div>

        <DashboardPlansPicker
          currentPlanId={currentPlanId}
          onPlanChange={setCurrentPlanId}
        />

        <p className="shrink-0 pb-2 text-center text-xs text-[var(--app-fg-muted)]">
          {tPricing("culqiComingSoon")}
        </p>
      </div>
    </StudentPageShell>
  );
}
