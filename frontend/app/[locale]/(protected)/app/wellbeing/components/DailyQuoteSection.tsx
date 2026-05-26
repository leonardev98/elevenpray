"use client";

import { useState } from "react";
import { Quote, RotateCcw } from "lucide-react";
import { DAILY_QUOTES } from "../wellbeing-mock-data";

export function DailyQuoteSection() {
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
    <section>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface-soft)] p-6 shadow-[var(--app-shadow-card)] transition-all duration-300 hover:shadow-lg">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--app-primary)]/10" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary)]/10">
            <Quote className="h-6 w-6 text-[var(--app-primary)]" aria-hidden />
          </div>
          <div
            className={`min-w-0 flex-1 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
          >
            <p className="text-lg font-medium leading-relaxed text-[var(--app-fg)]">
              "{DAILY_QUOTES[quoteIndex]}"
            </p>
            <p className="mt-3 text-sm text-[var(--app-fg-secondary)]">✨ Tu inspiración diaria</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Cambiar frase"
            className="shrink-0 self-start rounded-xl bg-[var(--app-surface)] p-2.5 text-[var(--app-fg-muted)] shadow-sm transition-all duration-200 hover:bg-[var(--app-primary)] hover:text-[var(--app-bg)] hover:shadow-md"
          >
            <RotateCcw className={`h-5 w-5 transition-transform duration-300 ${fading ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
