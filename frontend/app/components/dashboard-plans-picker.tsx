"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Brain, Check, GraduationCap, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLANS,
  formatPlanPrice,
  yearlyAmountCents,
  type BillingInterval,
  type PlanId,
} from "../lib/plans";
import { mockStartCheckout } from "../lib/billing-mock";
import { toast } from "../lib/toast";

const PLAN_ICONS: Record<PlanId, typeof GraduationCap> = {
  free: GraduationCap,
  plus: Zap,
  pro: Brain,
};

type DashboardPlansPickerProps = {
  currentPlanId: PlanId;
  onPlanChange?: (planId: PlanId) => void;
};

export function DashboardPlansPicker({
  currentPlanId,
  onPlanChange,
}: DashboardPlansPickerProps) {
  const t = useTranslations("pricing");
  const tPlan = useTranslations("studentPlan");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const handleSelectPlan = useCallback(
    async (planId: PlanId) => {
      if (planId === currentPlanId || planId === "free") return;
      setLoadingPlan(planId);
      try {
        await mockStartCheckout(planId, interval);
        toast.success(t("mockSuccess", { plan: t(`plans.${planId}.name`) }));
        onPlanChange?.(planId);
      } catch {
        toast.error(t("mockError"));
      } finally {
        setLoadingPlan(null);
      }
    },
    [currentPlanId, interval, onPlanChange, t]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--app-fg)]">
          {tPlan("chooseTitle")}
        </h2>
        <div
          className="inline-flex rounded-full border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-1"
          role="group"
          aria-label={t("billingToggle")}
        >
          {(["monthly", "yearly"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setInterval(key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                interval === key
                  ? "bg-[var(--app-primary)] text-[var(--app-bg)]"
                  : "text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]"
              )}
            >
              {t(key)}
              {key === "yearly" && (
                <span className="ml-1.5 text-xs text-emerald-500">{t("yearlySave")}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = PLAN_ICONS[plan.id];
          const isCurrent = plan.id === currentPlanId;
          const monthlyCents = plan.amountCents;
          const displayCents =
            interval === "yearly" && monthlyCents > 0
              ? Math.round(yearlyAmountCents(monthlyCents) / 12)
              : monthlyCents;
          const priceLabel = formatPlanPrice(displayCents, locale, "monthly");
          const billedNote =
            plan.amountCents > 0 && interval === "yearly"
              ? t("billedYearly", {
                  amount: formatPlanPrice(
                    yearlyAmountCents(plan.amountCents),
                    locale,
                    "yearly"
                  ),
                })
              : plan.id === "free"
                ? t("plans.free.forever")
                : null;

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex min-h-[320px] flex-col rounded-2xl border bg-[var(--app-surface)] p-5 md:min-h-0",
                isCurrent
                  ? "border-[var(--app-primary)] ring-1 ring-[var(--app-primary)]/40"
                  : "border-[var(--app-border)]",
                plan.highlighted && !isCurrent && "md:scale-[1.02]"
              )}
            >
              {plan.highlighted && !isCurrent && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--app-primary)] px-3 py-1 text-xs font-semibold text-[var(--app-bg)]">
                  {t("popular")}
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--app-primary)]">
                  {t("currentPlan")}
                </span>
              )}

              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-[var(--app-fg)]">
                    {t(`plans.${plan.id}.name`)}
                  </h3>
                  <p className="text-sm text-[var(--app-fg-secondary)]">
                    {t(`plans.${plan.id}.tagline`)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-3xl font-bold tracking-tight text-[var(--app-fg)]">
                  {priceLabel}
                </p>
                {billedNote && (
                  <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{billedNote}</p>
                )}
              </div>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                {plan.featureKeys.map((key) => (
                  <li
                    key={key}
                    className="flex gap-2.5 text-sm leading-snug text-[var(--app-fg-secondary)]"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-[var(--app-primary)]"
                      aria-hidden
                    />
                    <span>{t(`features.${key}`)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 shrink-0 pt-1">
                <Button
                  size="lg"
                  className="h-11 w-full rounded-xl"
                  variant={plan.highlighted && !isCurrent ? "default" : "outline"}
                  disabled={isCurrent || loadingPlan === plan.id || plan.id === "free"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {loadingPlan === plan.id
                    ? tCommon("loading")
                    : isCurrent
                      ? t("ctaCurrent")
                      : t(`cta.${plan.id}`)}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
