"use client";

export type TimelineRange = "today" | "7" | "30" | "all";

interface FaceMapTimelineProps {
  range: TimelineRange;
  onRangeChange: (range: TimelineRange) => void;
}

const LABELS: Record<TimelineRange, string> = {
  today: "Hoy",
  "7": "7 días",
  "30": "30 días",
  all: "Todo",
};

export function FaceMapTimeline({ range, onRangeChange }: FaceMapTimelineProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--app-fg)]/70">Período</span>
      <div className="inline-flex rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-0.5">
        {(["today", "7", "30", "all"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRangeChange(r)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              range === r
                ? "bg-[var(--app-navy)] text-[var(--app-white)]"
                : "text-[var(--app-fg)]/70 hover:text-[var(--app-fg)]"
            }`}
          >
            {LABELS[r]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getDateRangeFromTimeline(
  range: TimelineRange
): { from?: string; to?: string } {
  const to = new Date();
  const toStr = to.toISOString().slice(0, 10);
  if (range === "all") return {};
  if (range === "today") return { from: toStr, to: toStr };
  const days = range === "7" ? 7 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString().slice(0, 10), to: toStr };
}
