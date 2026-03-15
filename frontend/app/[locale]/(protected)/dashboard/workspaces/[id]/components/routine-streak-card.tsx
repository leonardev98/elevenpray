"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { StreakCalendar } from "@/components/habits/StreakCalendar";

interface RoutineStreakCardProps {
  workspaceId: string;
}

export function RoutineStreakCard({ workspaceId }: RoutineStreakCardProps) {
  const { token } = useAuth();
  const [completedDays, setCompletedDays] = useState<Date[]>([]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date();
    from.setDate(from.getDate() - 14);
    const fromStr = from.toISOString().slice(0, 10);
    getWorkspaceCheckins(token, workspaceId, { from: fromStr, to: today })
      .then((list) =>
        setCompletedDays(
          list.map((c) => {
            const d = new Date(c.checkinDate);
            d.setHours(0, 0, 0, 0);
            return d;
          })
        )
      )
      .catch(() => {});
  }, [token, workspaceId]);

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
      aria-labelledby="streak-calendar-heading"
    >
      <StreakCalendar completedDays={completedDays} />
    </section>
  );
}
