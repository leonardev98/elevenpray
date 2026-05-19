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
      <div className="flex items-stretch gap-3 rounded-[var(--app-radius-card,1.125rem)] border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-5 shadow-[var(--app-shadow-card)]">
        <Quote className="mt-0.5 h-5 w-5 shrink-0 text-[var(--app-primary)]" aria-hidden />
        <div
          className={`min-w-0 flex-1 transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          <p className="text-base font-medium leading-relaxed text-[var(--app-fg)]">
            {DAILY_QUOTES[quoteIndex]}
          </p>
          <p className="mt-2 text-xs text-[var(--app-fg-muted)]">Recuerda esto hoy</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Cambiar frase"
          className="shrink-0 self-start rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors duration-150 hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg-secondary)]"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
