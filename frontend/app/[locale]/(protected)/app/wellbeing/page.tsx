"use client";

import { useTranslations } from "next-intl";
import { StudentPageShell } from "../components/StudentPageShell";
import { DailyQuoteSection } from "./components/DailyQuoteSection";
import { MoodCheckInSection } from "./components/MoodCheckInSection";
import { BreathingSection } from "./components/BreathingSection";
import { PomodoroSection } from "./components/PomodoroSection";
import { ConsistencyHeatmap } from "./components/ConsistencyHeatmap";
import { EmotionalWeekSection } from "./components/EmotionalWeekSection";
import { ResourcesSection } from "./components/ResourcesSection";

export default function StudentWellbeingPage() {
  const t = useTranslations("studentWellbeing");

  return (
    <StudentPageShell title={t("title")}>
      <div className="space-y-12">
        <DailyQuoteSection />
        <MoodCheckInSection />
        <BreathingSection />
        <PomodoroSection />
        <ConsistencyHeatmap />
        <EmotionalWeekSection />
        <ResourcesSection />
      </div>

      <p className="mt-12 text-center text-xs text-[var(--app-fg-muted)]/70">
        {t("disclaimer")}
      </p>
    </StudentPageShell>
  );
}
