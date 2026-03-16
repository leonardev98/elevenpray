"use client";

import { useMemo } from "react";
import { ChevronDown, ChevronUp, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_STEP_5 = Array.from({ length: 12 }, (_, i) => i * 5);

function normalizeTime(value: string): { hour: number; minute: number } {
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour ?? 9);
  const minute = Number(rawMinute ?? 0);
  return {
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 9,
    minute: Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0,
  };
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutes(value: string, delta: number) {
  const { hour, minute } = normalizeTime(value);
  const total = hour * 60 + minute + delta;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(wrapped / 60);
  const nextMinute = wrapped % 60;
  return formatTime(nextHour, nextMinute);
}

const selectClass =
  "h-8 min-w-[3.5rem] appearance-none rounded-md border-0 bg-transparent px-1.5 text-xs text-[var(--app-fg)] focus:outline-none focus:ring-0 [&>option]:bg-[var(--app-surface)]";

export function TimePicker({
  value,
  onChange,
  className,
  minuteStep = 5,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  minuteStep?: 5 | 10 | 15 | 30;
  "aria-label"?: string;
}) {
  const { hour, minute } = normalizeTime(value);
  const minuteOptions = useMemo(() => {
    if (minuteStep === 5) return MINUTES_STEP_5;
    return Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);
  }, [minuteStep]);

  const nearestMinute = useMemo(() => {
    return minuteOptions.reduce((closest, current) =>
      Math.abs(current - minute) < Math.abs(closest - minute) ? current : closest
    );
  }, [minute, minuteOptions]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = Number(e.target.value);
    onChange(formatTime(h, nearestMinute));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = Number(e.target.value);
    onChange(formatTime(hour, m));
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-shrink items-center gap-1.5 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-1.5 transition focus-within:border-[var(--app-primary)] focus-within:ring-2 focus-within:ring-[var(--app-primary)]/15",
        className,
      )}
      tabIndex={0}
      role="group"
      aria-label={ariaLabel ?? "Selector de hora"}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onChange(addMinutes(value, minuteStep));
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onChange(addMinutes(value, -minuteStep));
        }
      }}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0 text-[var(--app-fg-muted)]" />
      <select
        aria-label="Hora"
        className={selectClass}
        value={hour}
        onChange={handleHourChange}
      >
        {HOURS.map((option) => (
          <option key={option} value={option}>
            {String(option).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className="text-xs text-[var(--app-fg-muted)]">:</span>
      <select
        aria-label="Minutos"
        className={selectClass}
        value={nearestMinute}
        onChange={handleMinuteChange}
      >
        {minuteOptions.map((option) => (
          <option key={option} value={option}>
            {String(option).padStart(2, "0")}
          </option>
        ))}
      </select>
      <div className="ml-auto flex flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-3.5 w-4 rounded-sm p-0 text-[var(--app-fg-muted)] hover:bg-[var(--app-primary)]/10 hover:text-[var(--app-primary)]"
          onClick={() => onChange(addMinutes(value, minuteStep))}
          aria-label="Incrementar tiempo"
        >
          <ChevronUp className="h-2.5 w-2.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="h-3.5 w-4 rounded-sm p-0 text-[var(--app-fg-muted)] hover:bg-[var(--app-primary)]/10 hover:text-[var(--app-primary)]"
          onClick={() => onChange(addMinutes(value, -minuteStep))}
          aria-label="Reducir tiempo"
        >
          <ChevronDown className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}
