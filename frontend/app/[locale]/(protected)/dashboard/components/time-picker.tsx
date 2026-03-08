"use client";

import { useMemo } from "react";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = ["00", "15", "30", "45"] as const;
const PERIODS = ["am", "pm"] as const;

export interface TimePickerProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  /** Si true, muestra selector de minutos (00, 15, 30, 45). Por defecto false. */
  showMinutes?: boolean;
  className?: string;
}

/** Parsea strings como "8 am", "8:00 am", "9:30 pm" a { hour, minutes, period }. */
function parseTimeString(value: string | undefined): {
  hour: number;
  minutes: string;
  period: "am" | "pm";
} | null {
  if (!value || !value.trim()) return null;
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const minutesRaw = match[2] ? match[2].padStart(2, "0") : "00";
  const minutes = MINUTES.includes(minutesRaw as (typeof MINUTES)[number])
    ? minutesRaw
    : "00";
  let period: "am" | "pm" = (match[3] as "am" | "pm") || "am";
  if (hour === 12 && period === "am") hour = 0;
  if (hour === 12 && period === "pm") hour = 12;
  if (hour > 12) {
    hour = hour % 12;
    period = "pm";
  }
  if (hour === 0) hour = 12;
  return { hour, minutes, period };
}

function toTimeString(hour: number, minutes: string, period: "am" | "pm"): string {
  const h = hour === 12 ? 12 : hour;
  if (minutes === "00") return `${h} ${period}`;
  return `${h}:${minutes} ${period}`;
}

export function TimePicker({
  value,
  onChange,
  showMinutes = false,
  className = "",
}: TimePickerProps) {
  const parsed = useMemo(() => parseTimeString(value), [value]);

  const hour = parsed?.hour ?? 8;
  const minutes = parsed?.minutes ?? "00";
  const period = parsed?.period ?? "am";

  const handleChange = (
    nextHour: number,
    nextMinutes: string,
    nextPeriod: "am" | "pm"
  ) => {
    const str = toTimeString(nextHour, nextMinutes, nextPeriod);
    onChange(str);
  };

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      role="group"
      aria-label="Horario"
    >
      <select
        value={hour}
        onChange={(e) =>
          handleChange(Number(e.target.value), minutes, period)
        }
        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        aria-label="Hora"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      {showMinutes && (
        <select
          value={minutes}
          onChange={(e) =>
            handleChange(hour, e.target.value as (typeof MINUTES)[number], period)
          }
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          aria-label="Minutos"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              :{m}
            </option>
          ))}
        </select>
      )}
      <select
        value={period}
        onChange={(e) =>
          handleChange(hour, minutes, e.target.value as "am" | "pm")
        }
        className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5 text-sm font-medium text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        aria-label="AM/PM"
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {p.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
