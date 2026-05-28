"use client";

import { useEffect } from "react";
import { DayTimeline } from "./DayTimeline";
import { LisyyDailyAction } from "./LisyyDailyAction";
import { TodayCheckInSummary } from "./TodayCheckInSummary";
import { WellbeingActionsGrid } from "./WellbeingActionsGrid";
import { useWellbeingDayContext } from "./WellbeingDayProvider";

export function DayDiaryView() {
  const { entries, reload } = useWellbeingDayContext();

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="flex flex-col gap-4">
      <TodayCheckInSummary index={0} />
      <LisyyDailyAction index={1} />
      <DayTimeline entries={entries} />
      <WellbeingActionsGrid index={2} />
    </div>
  );
}
