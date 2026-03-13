"use client";

import {
  ISSUE_TYPES,
  ISSUE_TYPE_COLORS,
} from "@/app/lib/skincare/face-map/face-map.constants";
import type { IssueType } from "@/app/lib/skincare/face-map/face-map.types";

const ISSUE_LABELS: Record<IssueType, string> = {
  acne: "Acné",
  blackheads: "Puntos negros",
  redness: "Rojeces",
  pigmentation: "Manchas",
  dryness: "Resequedad",
  irritation: "Irritación",
  scar: "Cicatrices",
  sensitivity: "Sensibilidad",
  "pore-congestion": "Poros",
  custom: "Otro",
};

export function FaceMapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--app-fg)]/80">
      {ISSUE_TYPES.slice(0, 6).map((t) => (
        <span key={t} className="inline-flex shrink-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--app-border)]"
            style={{ backgroundColor: ISSUE_TYPE_COLORS[t] }}
          />
          <span className="whitespace-nowrap">{ISSUE_LABELS[t]}</span>
        </span>
      ))}
      <span className="inline-flex shrink-0 items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--app-border)] bg-[var(--app-navy)]" />
        <span className="whitespace-nowrap">…</span>
      </span>
    </div>
  );
}
