"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useWellbeingCheckInContext } from "./WellbeingCheckInContext";
import { useWellbeingAcademicContext } from "../hooks/useWellbeingAcademicContext";
import { getDailyAction } from "../lib/get-daily-action";
import { BREATHING_EXERCISES } from "../wellbeing-mock-data";
import { BreathingModal } from "./BreathingModal";
import { GuidedJournalModal } from "./GuidedJournalModal";
import { WellbeingPomodoroPanel } from "./WellbeingPomodoroPanel";
import { isNightTime } from "../lib/get-greeting";
import { useWellbeingDayContext } from "./WellbeingDayProvider";
import { STUDY_PAGE_ENABLED } from "@/app/lib/feature-flags";

const LIZYY_IMAGE_URL =
  "https://mitsyy-bucket.s3.us-east-2.amazonaws.com/lizyy+sin+fonod.png";

export function LisyyDailyAction({ index = 0 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const router = useRouter();
  const { selectedMood, factors } = useWellbeingCheckInContext();
  const academic = useWellbeingAcademicContext();
  const { addEntry } = useWellbeingDayContext();
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const delayStyle = { "--wellbeing-delay": `${index * 80}ms` } as React.CSSProperties;

  if (!selectedMood) return null;

  const recommendation = getDailyAction(selectedMood, factors, academic);
  const nightMode = isNightTime();
  const isFocusAction =
    !nightMode &&
    (recommendation.actionType === "pomodoro" || recommendation.actionType === "study");

  function handleCta() {
    if (nightMode) {
      setJournalOpen(true);
      return;
    }
    switch (recommendation.actionType) {
      case "breathing":
        setBreathingOpen(true);
        break;
      case "flashcards":
        router.push(STUDY_PAGE_ENABLED ? "/app/study?tab=flashcards" : "/app/courses");
        break;
      case "pomodoro":
      case "study":
        break;
    }
  }

  const lisyySizeClass = isFocusAction
    ? "h-28 w-28 sm:h-32 sm:w-32"
    : "h-[140px] w-[140px] sm:h-[160px] sm:w-[160px]";

  return (
    <section className="wellbeing-calm-block" style={delayStyle}>
      <div className="wellbeing-dashboard-tile overflow-hidden rounded-3xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] px-5 py-4 shadow-sm sm:px-6 sm:py-5">
        <div
          className={`flex flex-col gap-4 ${
            isFocusAction ? "sm:flex-row sm:items-start" : "sm:flex-row sm:items-center"
          }`}
        >
          <div className={`relative mx-auto shrink-0 sm:mx-0 ${lisyySizeClass}`}>
            <Image
              src={LIZYY_IMAGE_URL}
              alt="Lisyy"
              width={160}
              height={160}
              unoptimized
              className="h-full w-full object-contain object-bottom"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-balance text-base leading-relaxed text-[var(--app-fg-secondary)] sm:text-lg ${
                isFocusAction ? "text-center sm:text-left" : "text-center sm:text-left"
              }`}
            >
              {nightMode
                ? t("dailyAction.nightReflection")
                : t(recommendation.messageKey, recommendation.messageParams)}
            </p>

            {isFocusAction ? (
              <div className="mt-4 border-t border-[var(--app-border)]/40 pt-4">
                <WellbeingPomodoroPanel
                  onComplete={(meta) => void addEntry({ entryType: "pomodoro", payload: meta })}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCta}
                className="mt-4 min-h-12 w-full rounded-xl bg-[var(--app-primary)] px-6 text-base font-semibold text-[var(--app-bg)] shadow-md transition-opacity hover:opacity-95 sm:w-auto"
              >
                {nightMode ? t("dailyAction.ctaJournal") : t(recommendation.ctaKey)}
              </button>
            )}
          </div>
        </div>
      </div>

      <BreathingModal
        exercise={BREATHING_EXERCISES[0]}
        open={breathingOpen}
        onClose={() => setBreathingOpen(false)}
        onComplete={(meta) => void addEntry({ entryType: "breathing", payload: meta })}
        fullscreen
      />
      <GuidedJournalModal open={journalOpen} onClose={() => setJournalOpen(false)} />
    </section>
  );
}
