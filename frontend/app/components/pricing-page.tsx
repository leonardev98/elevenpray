"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { PlansGrid } from "./plans-grid";
import { getEffectiveUserPlan } from "../lib/user-plan";
import type { PlanId } from "../lib/plans";
import { useAuth } from "../providers/auth-provider";

export function PricingPage() {
  const t = useTranslations("pricing");
  const tLanding = useTranslations("landing");
  const { token } = useAuth();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(() =>
    token ? getEffectiveUserPlan().planId : null
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139, 92, 246, 0.4), transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 60%, rgba(245, 158, 11, 0.15), transparent),
            radial-gradient(ellipse 40% 30% at 10% 90%, rgba(59, 130, 246, 0.2), transparent)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:56px_56px]"
        aria-hidden
      />

      <FloatingNav
        alwaysVisible
        linkComponent={Link}
        logo={
          <Link href="/" className="text-lg font-semibold text-white">
            {tLanding("title")}
          </Link>
        }
        navItems={[
          { name: tLanding("navProduct"), link: "/#domains" },
          { name: tLanding("navPricing"), link: "/#pricing" },
          { name: tLanding("navTemplates"), link: "/#plantillas" },
        ]}
        rightContent={
          <>
            <LocaleSwitcher />
            <ThemeToggle />
            {token ? (
              <Link
                href="/app/plan"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white/90"
              >
                {t("goToApp")}
              </Link>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white/90"
              >
                {tLanding("startFree")}
              </Link>
            )}
          </>
        }
      />

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            {t("eyebrow")}
          </span>
          <h1
            className="mt-5 font-extrabold tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}
          >
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-white/65 sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <PlansGrid
            variant="landing"
            currentPlanId={currentPlanId}
            authenticated={!!token}
            onPlanChange={(id) => setCurrentPlanId(id)}
          />
        </div>

        <section className="mt-20 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-semibold text-white">{t("faqTitle")}</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            {(["changePlan", "paymentMethods", "cancel"] as const).map((key) => (
              <div key={key}>
                <dt className="font-medium text-white">{t(`faq.${key}.q`)}</dt>
                <dd className="mt-2 text-sm text-white/55">{t(`faq.${key}.a`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-8 text-center text-xs text-white/35">{t("culqiComingSoon")}</p>
      </main>
    </div>
  );
}
