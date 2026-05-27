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
      className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-base)] py-16 sm:py-24"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--accent-subtle)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            {t("badge")}
          </span>
          <h2
            className="mt-5 font-extrabold tracking-tight text-[var(--text-primary)]"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em" }}
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-base text-[var(--text-body)] sm:text-lg">{t("subtitle")}</p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <PlansGrid variant="landing" currentPlanId={null} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]"
          >
            {t("compareLink")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="text-center text-xs text-[var(--text-muted)]">{t("studentNote")}</p>
        </div>
      </div>
    </section>
  );
}
