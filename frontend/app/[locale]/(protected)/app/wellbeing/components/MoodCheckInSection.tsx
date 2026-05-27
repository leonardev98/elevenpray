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

interface MoodCheckInSectionProps {
  onMoodChange?: (mood: MoodId) => void;
}

export function MoodCheckInSection({ onMoodChange }: MoodCheckInSectionProps) {
  const [selected, setSelected] = useState<MoodId>("good");
  const [messageVisible, setMessageVisible] = useState(true);

  function handleSelect(id: MoodId) {
    if (id === selected) return;
    setMessageVisible(false);
    setTimeout(() => {
      setSelected(id);
      setMessageVisible(true);
      onMoodChange?.(id);
    }, 100);
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Smile className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          ¿Cómo te sientes hoy?
        </h2>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {MOOD_OPTIONS.map(({ id, label }) => {
          const Icon = MOOD_ICONS[id];
          const isActive = selected === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(id)}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                isActive
                  ? "border-[var(--app-primary)] bg-gradient-to-br from-[var(--app-primary)]/20 to-[var(--app-primary)]/5 shadow-lg scale-105"
                  : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/40 hover:shadow-md hover:-translate-y-1"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-[var(--app-primary)] shadow-lg"
                  : "bg-[var(--app-surface-soft)] group-hover:bg-[var(--app-primary)]/10"
              }`}>
                <Icon
                  className={`h-6 w-6 transition-colors duration-300 ${
                    isActive ? "text-[var(--app-bg)]" : "text-[var(--app-fg-secondary)] group-hover:text-[var(--app-primary)]"
                  }`}
                  aria-hidden
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isActive ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)] group-hover:text-[var(--app-fg-secondary)]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className={`mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-4 text-center shadow-sm transition-all duration-300 ${
          messageVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <p className="text-sm text-[var(--app-fg-secondary)] leading-relaxed">
          {MOOD_MESSAGES[selected]}
        </p>
      </div>
    </section>
  );
}
