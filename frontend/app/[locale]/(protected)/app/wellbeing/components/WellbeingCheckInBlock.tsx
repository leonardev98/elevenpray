"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { Zap, Smile, Meh, Frown, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import type { MoodId } from "../wellbeing-types";
import { MOOD_OPTIONS } from "../wellbeing-mock-data";
import { useWellbeingCheckInContext } from "./WellbeingCheckInContext";
import { getGreetingKey } from "../lib/get-greeting";

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  excellent: Zap,
  good: Smile,
  normal: Meh,
  low: Frown,
  bad: Moon,
};

function formatTodayDate(): string {
  const formatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function WellbeingCheckInBlock({ index = 0 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "estudiante";
  const {
    selectedMood,
    factors,
    note,
    hydrated,
    saving,
    savedFlash,
    saveError,
    visibleFactors,
    selectMood,
    toggleFactor,
    updateNote,
    saveCheckIn,
  } = useWellbeingCheckInContext();

  const showFollowUp = hydrated && selectedMood !== null;
  const delayStyle = { "--wellbeing-delay": `${index * 80}ms` } as React.CSSProperties;

  return (
    <section
      className="wellbeing-calm-block"
      style={delayStyle}
      id="register-check-in"
      aria-labelledby="wellbeing-greeting"
    >
      <div className="rounded-3xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-6 shadow-sm sm:p-8">
        <h1
          id="wellbeing-greeting"
          className="text-2xl font-semibold leading-snug text-[var(--app-fg)] sm:text-3xl"
        >
          {t(getGreetingKey(), { name: firstName })}
          <span className="mt-1 block text-xl font-normal text-[var(--app-fg-secondary)] sm:text-2xl">
            {t("greetingQuestion")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-[var(--app-fg-muted)]">{formatTodayDate()}</p>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:justify-start lg:overflow-visible">
          {MOOD_OPTIONS.map(({ id }) => {
            const Icon = MOOD_ICONS[id];
            const isActive = selectedMood === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectMood(id)}
                className={`flex min-w-[4.5rem] flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition-all duration-300 sm:min-w-[5rem] sm:px-3 ${
                  isActive
                    ? "border-[var(--app-primary)] bg-[var(--app-primary)]/12 shadow-sm"
                    : "border-[var(--app-border)]/80 bg-[var(--app-surface)] hover:scale-105 hover:border-[var(--app-primary)]/35 motion-reduce:hover:scale-100"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12 ${
                    isActive ? "bg-[var(--app-primary)]" : "bg-[var(--app-surface-soft)]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      isActive ? "text-[var(--app-bg)]" : "text-[var(--app-fg-secondary)]"
                    }`}
                    aria-hidden
                  />
                </span>
                <span
                  className={`text-center text-xs font-medium leading-tight ${
                    isActive ? "text-[var(--app-primary)]" : "text-[var(--app-fg-muted)]"
                  }`}
                >
                  {t(`moods.${id}`)}
                </span>
              </button>
            );
          })}
        </div>

        {showFollowUp && selectedMood ? (
          <div className="mt-10 space-y-5 animate-wellbeing-enter">
            <div>
              <p className="mb-3 text-base text-[var(--app-fg-secondary)]">{t("contextQuestion")}</p>
              <div className="flex flex-wrap gap-2">
                {visibleFactors.map((id) => {
                  const isSelected = factors.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleFactor(id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 text-[var(--app-primary)]"
                          : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]/40"
                      }`}
                    >
                      {t(`factors.${id}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => updateNote(e.target.value)}
              placeholder={t("diaryPlaceholder")}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/50 focus:outline-none"
            />

            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveCheckIn()}
                className="min-h-12 w-full rounded-xl bg-[var(--app-primary)] px-8 text-sm font-semibold text-[var(--app-bg)] shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
              >
                {saving ? t("savingCheckIn") : t("saveCheckIn")}
              </button>
              {savedFlash ? (
                <span className="text-sm text-[var(--app-primary)]">{t("savedConfirmation")}</span>
              ) : null}
              {saveError ? <span className="text-sm text-[var(--error)]">{saveError}</span> : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
