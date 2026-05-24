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
  { icon: typeof Sparkles; accent: string; glow: string }
> = {
  free: {
    icon: GraduationCap,
    accent: "from-zinc-500/20 to-zinc-600/5",
    glow: "",
  },
  plus: {
    icon: Zap,
    accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
    glow: "shadow-[0_0_40px_-8px_rgba(139,92,246,0.45)]",
  },
  pro: {
    icon: Brain,
    accent: "from-amber-500/20 via-orange-500/10 to-transparent",
    glow: "shadow-[0_0_40px_-8px_rgba(245,158,11,0.35)]",
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
          "inline-flex rounded-full border p-1 backdrop-blur-md",
          isLanding
            ? "border-white/15 bg-white/5"
            : "border-[var(--app-border)] bg-[var(--app-surface)]",
          !isLanding && variant === "page" && "mx-auto"
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
                ? isLanding
                  ? "bg-white text-zinc-900 shadow-lg"
                  : "bg-[var(--app-primary)] text-[var(--app-bg)]"
                : isLanding
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--app-fg-secondary)] hover:text-[var(--app-fg)]"
            )}
          >
            {t(key)}
            {key === "yearly" && (
              <span
                className={cn(
                  "ml-1.5 text-xs font-semibold",
                  isLanding ? "text-emerald-300" : "text-emerald-500"
                )}
              >
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
                "relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                isLanding
                  ? "border-white/10 bg-white/[0.04] backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.07]"
                  : "border-[var(--app-border)] bg-[var(--app-surface)]",
                plan.highlighted && !isCurrent && (isLanding ? meta.glow : "ring-2 ring-[var(--app-primary)]/50"),
                isCurrent && "ring-2 ring-[var(--app-primary)]",
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
                  className={cn(
                    "absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold",
                    isLanding
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white"
                      : "bg-[var(--app-primary)] text-[var(--app-bg)]"
                  )}
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
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      isLanding
                        ? "bg-white/10 text-white"
                        : "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3
                      className={cn(
                        "text-lg font-bold tracking-tight",
                        isLanding ? "text-white" : "text-[var(--app-fg)]"
                      )}
                    >
                      {t(`plans.${plan.id}.name`)}
                    </h3>
                    <p
                      className={cn(
                        "text-sm",
                        isLanding ? "text-white/60" : "text-[var(--app-fg-secondary)]"
                      )}
                    >
                      {t(`plans.${plan.id}.tagline`)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p
                    className={cn(
                      "text-4xl font-bold tracking-tight",
                      isLanding ? "text-white" : "text-[var(--app-fg)]"
                    )}
                  >
                    {priceLabel}
                  </p>
                  {billedNote && (
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isLanding ? "text-white/50" : "text-[var(--app-fg-muted)]"
                      )}
                    >
                      {billedNote}
                    </p>
                  )}
                </div>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.featureKeys.map((key) => (
                    <li
                      key={key}
                      className={cn(
                        "flex gap-2.5 text-sm",
                        isLanding ? "text-white/85" : "text-[var(--app-fg-secondary)]"
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          plan.id === "pro"
                            ? "text-amber-400"
                            : plan.id === "plus"
                              ? "text-violet-400"
                              : "text-emerald-500"
                        )}
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
                      className={cn(
                        "h-11 w-full rounded-xl font-medium",
                        isLanding &&
                          "border-white/20 bg-white text-zinc-900 hover:bg-white/90"
                      )}
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
                          "border-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white hover:opacity-90",
                        isLanding &&
                          !plan.highlighted &&
                          plan.id === "pro" &&
                          "border border-amber-500/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                      )}
                      variant={
                        !isLanding && plan.highlighted && !isCurrent
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
