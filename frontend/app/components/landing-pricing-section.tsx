"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { PlansGrid } from "./plans-grid";

export function LandingPricingSection() {
  const t = useTranslations("landingPricing");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t border-[var(--app-border)] py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#050508]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.35), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(245, 158, 11, 0.12), transparent),
            radial-gradient(ellipse 50% 30% at 0% 80%, rgba(59, 130, 246, 0.15), transparent)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            {t("badge")}
          </span>
          <h2
            className="mt-5 font-extrabold tracking-tight text-white"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-white/65 sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <PlansGrid variant="landing" currentPlanId={null} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
          >
            {t("compareLink")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="text-center text-xs text-white/40">{t("studentNote")}</p>
        </div>
      </div>
    </section>
  );
}
