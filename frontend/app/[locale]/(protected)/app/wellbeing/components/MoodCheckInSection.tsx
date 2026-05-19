"use client";

import { useState } from "react";
import { Zap, Smile, Meh, Frown, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MoodId } from "../wellbeing-types";
import { MOOD_MESSAGES, MOOD_OPTIONS } from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  excellent: Zap,
  good: Smile,
  normal: Meh,
  low: Frown,
  bad: Moon,
};

export function MoodCheckInSection() {
  const [selected, setSelected] = useState<MoodId>("good");
  const [messageVisible, setMessageVisible] = useState(true);

  function handleSelect(id: MoodId) {
    if (id === selected) return;
    setMessageVisible(false);
    setTimeout(() => {
      setSelected(id);
      setMessageVisible(true);
    }, 100);
  }

  return (
    <section>
      <SectionLabel>¿CÓMO ESTÁS HOY?</SectionLabel>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {MOOD_OPTIONS.map(({ id, label }) => {
          const Icon = MOOD_ICONS[id];
          const isActive = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(id)}
              className={`flex min-w-[4.5rem] flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all duration-150 sm:max-w-[5.5rem] ${
                isActive
                  ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                  : "border-transparent bg-[var(--app-surface-soft)] hover:border-[var(--app-border)]"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-[var(--app-primary)]" : "text-[var(--app-fg-secondary)]"}`}
                aria-hidden
              />
              <span
                className={`text-xs ${isActive ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)]"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <p
        className={`mt-4 text-center text-sm text-[var(--app-fg-secondary)] transition-opacity duration-200 ${
          messageVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {MOOD_MESSAGES[selected]}
      </p>
    </section>
  );
}
