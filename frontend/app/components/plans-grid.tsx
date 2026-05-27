"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Brain, Check, GraduationCap, Sparkles, Zap } from "lucide-react";
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

const PLAN_META: Record<
  PlanId,
  { icon: typeof Sparkles; accent: string; glow: string; checkClass: string }
> = {
  free: {
    icon: GraduationCap,
    accent: "from-[var(--accent-subtle)] to-transparent",
    glow: "",
    checkClass: "text-[var(--accent)]",
  },
  plus: {
    icon: Zap,
    accent: "from-[var(--accent-subtle)] via-[var(--bg-surface)] to-transparent",
    glow: "shadow-[var(--shadow-md)]",
    checkClass: "text-[var(--accent)]",
  },
  pro: {
    icon: Brain,
    accent: "from-[var(--course-2-bg)]/80 via-transparent to-transparent",
    glow: "shadow-[var(--shadow-md)]",
    checkClass: "text-[var(--xp)]",
  },
};

type PlansGridProps = {
  currentPlanId: PlanId | null;
  authenticated?: boolean;
  onPlanChange?: (planId: PlanId) => void;
  variant?: "landing" | "dashboard" | "page";
};

export function PlansGrid({
  currentPlanId,
  authenticated = false,
  onPlanChange,
  variant = "page",
}: PlansGridProps) {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const isLanding = variant === "landing";

  const handleSelectPlan = useCallback(
    async (planId: PlanId) => {
      if (currentPlanId !== null && planId === currentPlanId) return;
      if (planId === "free") return;

      if (!authenticated) {
        window.location.href = `/login?redirect=${encodeURIComponent("/pricing")}`;
        return;
      }

      setLoadingPlan(planId);
      try {
        const result = await mockStartCheckout(planId, interval);
        toast.success(t("mockSuccess", { plan: t(`plans.${planId}.name`) }));
        onPlanChange?.(planId);
        console.info("[billing-mock]", result);
      } catch {
        toast.error(t("mockError"));
      } finally {
        setLoadingPlan(null);
      }
    },
    [authenticated, currentPlanId, interval, onPlanChange, t]
  );

  return (
    <div className={cn(isLanding && "w-full")}>
      <div
        className={cn(
          "inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-surface)] p-1 backdrop-blur-md",
          (variant === "page" || isLanding) && "mx-auto"
        )}
        role="group"
        aria-label={t("billingToggle")}
      >
        {(["monthly", "yearly"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setInterval(key)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              interval === key
                ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
            )}
          >
            {t(key)}
            {key === "yearly" && (
              <span className="ml-1.5 text-xs font-semibold text-[var(--accent)]">
                {t("yearlySave")}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "mt-10 grid gap-5",
          variant === "dashboard"
            ? "md:grid-cols-3"
            : "md:grid-cols-3 lg:gap-6",
          isLanding && "lg:mt-12"
        )}
      >
        {PLANS.map((plan) => {
          const meta = PLAN_META[plan.id];
          const Icon = meta.icon;
          const isCurrent = currentPlanId !== null && plan.id === currentPlanId;
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
                "relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-300",
                plan.highlighted && !isCurrent && (meta.glow || "ring-2 ring-[var(--accent)]/40"),
                isCurrent && "ring-2 ring-[var(--accent)]",
                plan.highlighted && isLanding && "lg:-translate-y-1"
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                  meta.accent
                )}
                aria-hidden
              />

              {plan.highlighted && !isCurrent && (
                <span
                  className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--accent-fg)]"
                >
                  {t("popular")}
                </span>
              )}
              {isCurrent && (
                <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--app-primary)] bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--app-primary)]">
                  {t("currentPlan")}
                </span>
              )}

              <div className="relative flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                      {t(`plans.${plan.id}.name`)}
                    </h3>
                    <p className="text-sm text-[var(--text-body)]">
                      {t(`plans.${plan.id}.tagline`)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                    {priceLabel}
                  </p>
                  {billedNote && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {billedNote}
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.featureKeys.map((key) => (
                    <li
                      key={key}
                      className="flex gap-2.5 text-sm text-[var(--text-body)]"
                    >
                      <Check
                        className={cn("mt-0.5 size-4 shrink-0", meta.checkClass)}
                        aria-hidden
                      />
                      <span>{t(`features.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.id === "free" && !authenticated ? (
                    <Button
                      asChild
                      className="h-11 w-full rounded-xl font-medium"
                      variant={isLanding ? "default" : "outline"}
                      size="lg"
                    >
                      <Link href="/register">{t("cta.free")}</Link>
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "h-11 w-full rounded-xl font-medium",
                        isLanding &&
                          plan.highlighted &&
                          "border-0 bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90",
                        isLanding &&
                          !plan.highlighted &&
                          plan.id === "pro" &&
                          "border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--accent-subtle)]"
                      )}
                      variant={
                        plan.highlighted && !isCurrent && !isLanding
                          ? "default"
                          : isLanding && plan.highlighted
                            ? "default"
                            : "outline"
                      }
                      size="lg"
                      disabled={
                        isCurrent ||
                        loadingPlan === plan.id ||
                        (plan.id === "free" && authenticated)
                      }
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {loadingPlan === plan.id
                        ? tCommon("loading")
                        : isCurrent
                          ? t("ctaCurrent")
                          : t(`cta.${plan.id}`)}
                    </Button>
                  )}
                  {plan.id !== "free" && !isCurrent && variant !== "landing" && (
                    <p className="mt-2 text-center text-xs text-[var(--app-fg-muted)]">
                      {t("mockPaymentNote")}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
