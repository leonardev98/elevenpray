"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CheckinData } from "../../../../../../lib/workspace-checkins-api";

/**
 * Score = (hydration + (5-oiliness) + (5-irritation) + (5-acne)) / 4
 * Normalizado a 0-100 para el ring.
 */
export function getSkinScoreFromCheckin(data: CheckinData | null | undefined): number | null {
  if (!data) return null;
  const h = data.hydration ?? 3;
  const o = data.oiliness ?? 3;
  const i = data.irritation ?? 1;
  const a = data.acne ?? 1;
  const raw = (h + (5 - o) + (5 - i) + (5 - a)) / 4;
  const clamped = Math.max(1, Math.min(5, raw));
  return Math.round((clamped / 5) * 100);
}

function getScoreLabel(scorePercent: number): "excellent" | "good" | "unstable" | "problems" {
  if (scorePercent >= 80) return "excellent";
  if (scorePercent >= 60) return "good";
  if (scorePercent >= 40) return "unstable";
  return "problems";
}

const EMOJI: Record<string, string> = {
  excellent: "✨",
  good: "👍",
  unstable: "😐",
  problems: "😟",
};

interface SkinHealthScoreProps {
  /** Datos del check-in de hoy o el último disponible */
  checkinData: CheckinData | null | undefined;
  dateLabel?: string;
}

export function SkinHealthScore({ checkinData, dateLabel }: SkinHealthScoreProps) {
  const t = useTranslations("workspaceNav");
  const tScore = useTranslations("skinScore");

  const { scorePercent, label } = useMemo(() => {
    const percent = getSkinScoreFromCheckin(checkinData);
    if (percent == null) return { scorePercent: null, label: null as string | null };
    const key = getScoreLabel(percent);
    return {
      scorePercent: percent,
      label: tScore(key),
    };
  }, [checkinData, tScore]);

  if (scorePercent == null || label == null) {
    return (
      <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
        <CardHeader className="pb-1">
          <h3 className="text-base font-semibold text-[var(--app-fg)]">
            {tScore("title")}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--app-fg)]/70">{tScore("noData")}</p>
        </CardContent>
      </Card>
    );
  }

  const color =
    scorePercent >= 80
      ? "var(--app-navy)"
      : scorePercent >= 60
        ? "#22c55e"
        : scorePercent >= 40
          ? "#eab308"
          : "#ef4444";

  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader className="pb-1">
        <h3 className="text-base font-semibold text-[var(--app-fg)]">
          {tScore("title")}
        </h3>
        {dateLabel && (
          <p className="text-xs text-[var(--app-fg)]/70">{dateLabel}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <div className="h-24 w-24">
          <CircularProgressbar
            value={scorePercent}
            text={`${scorePercent}`}
            styles={buildStyles({
              pathColor: color,
              textColor: "var(--app-fg)",
              textSize: "1.5rem",
              trailColor: "var(--app-border)",
            })}
          />
        </div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--app-fg)]">
          <span aria-hidden>{EMOJI[getScoreLabel(scorePercent)]}</span>
          {label}
        </p>
      </CardContent>
    </Card>
  );
}
