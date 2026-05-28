"use client";

import type { CSSProperties } from "react";
import { DailyQuoteTile } from "./DailyQuoteTile";
import { MonthlyMoodCalendar } from "./MonthlyMoodCalendar";
import { CorrelationInsightTile } from "./CorrelationInsightTile";
import { CheckInStreakTile } from "./CheckInStreakTile";
import { useWellbeingSidebarData } from "../hooks/useWellbeingSidebarData";

export function WellbeingDataSidebar() {
  const { loading, summary, history, bestStreak } = useWellbeingSidebarData();
  const delayStyle = { "--wellbeing-delay": "120ms" } as CSSProperties;
  const checkInDays = new Set(history.map((entry) => entry.checkInDate)).size;

  return (
    <aside className="wellbeing-calm-block space-y-4" style={delayStyle}>
      <DailyQuoteTile />
      <MonthlyMoodCalendar history={history} loading={loading} />
      <CorrelationInsightTile insights={summary?.insights ?? []} checkInDays={checkInDays} />
      <CheckInStreakTile streak={summary?.streak ?? 0} bestStreak={bestStreak} />
    </aside>
  );
}
