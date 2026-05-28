"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Quote, RotateCcw } from "lucide-react";
import { DAILY_QUOTES } from "../wellbeing-mock-data";

export function DailyQuoteTile() {
  const t = useTranslations("studentWellbeing");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fading, setFading] = useState(false);

  function handleRefresh() {
    setFading(true);
    setTimeout(() => {
      setQuoteIndex((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * DAILY_QUOTES.length);
        }
        return next;
      });
      setFading(false);
    }, 200);
  }

  return (
    <section className="wellbeing-dashboard-tile relative isolate overflow-hidden rounded-2xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-5 shadow-sm">
      <div
        className="pointer-events-none absolute right-0 top-0 h-14 w-14 translate-x-1/4 -translate-y-1/4 rounded-full bg-[var(--app-primary)]/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-10 w-10 translate-y-1/4 rounded-full bg-[var(--app-primary)]/5"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)]/15">
            <Quote className="h-4 w-4 text-[var(--app-primary)]" aria-hidden />
          </div>
          <p className="text-xs font-medium text-[var(--app-fg-muted)]">{t("dailyQuoteLabel")}</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label={t("dailyQuoteRefresh")}
          className="shrink-0 rounded-lg bg-[var(--app-surface)]/80 p-2 text-[var(--app-fg-muted)] transition-all hover:bg-[var(--app-surface)] hover:text-[var(--app-primary)]"
        >
          <RotateCcw
            className={`h-4 w-4 transition-transform duration-300 ${fading ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <p
        className={`relative mt-3 text-base font-medium leading-relaxed text-[var(--app-fg)] transition-opacity duration-300 sm:text-lg ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        &ldquo;{DAILY_QUOTES[quoteIndex]}&rdquo;
      </p>
    </section>
  );
}
