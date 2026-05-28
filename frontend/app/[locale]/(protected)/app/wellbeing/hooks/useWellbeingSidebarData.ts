"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { useAuth } from "@/app/providers/auth-provider";
import {
  getEmotionalCheckInHistory,
  getEmotionalCheckInSummary,
  type EmotionalHistoryEntry,
  type EmotionalSummaryDto,
} from "@/app/lib/emotional-checkins-api";

function computeBestStreak(entries: EmotionalHistoryEntry[]): number {
  const uniqueSorted = [...new Set(entries.map((entry) => entry.checkInDate))].sort();
  if (uniqueSorted.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < uniqueSorted.length; i++) {
    const prev = new Date(`${uniqueSorted[i - 1]}T00:00:00`);
    const currentDate = new Date(`${uniqueSorted[i]}T00:00:00`);
    const diffDays = Math.round((currentDate.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

export function useWellbeingSidebarData() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<EmotionalSummaryDto | null>(null);
  const [history, setHistory] = useState<EmotionalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setSummary(null);
      setHistory([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const fromDate = format(subDays(new Date(), 365), "yyyy-MM-dd");
        const [summaryData, historyData] = await Promise.all([
          getEmotionalCheckInSummary(token),
          getEmotionalCheckInHistory(token, fromDate),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setHistory(historyData);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
          setHistory([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const bestStreak = useMemo(() => computeBestStreak(history), [history]);

  return {
    loading,
    summary,
    history,
    bestStreak,
  };
}
