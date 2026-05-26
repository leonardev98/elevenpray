"use client";

import { useMemo } from "react";
import { Time } from "@internationalized/date";
import {
  TimeField as AriaTimeField,
  DateInput,
  DateSegment,
  Label,
} from "react-aria-components";
import { cn } from "@/lib/utils";

function parseTimeString(value: string): { hour: number; minute: number } {
  const [rawHour, rawMinute] = (value ?? "").split(":");
  const hour = Number(rawHour ?? 9);
  const minute = Number(rawMinute ?? 0);
  return {
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 9,
    minute: Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0,
  };
}

function timeToHHmm(time: Time): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

export function TimePicker({
  value,
  onChange,
  label,
  className,
  isInvalid,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  label?: string;
  className?: string;
  isInvalid?: boolean;
  "aria-label"?: string;
}) {
  const { hour, minute } = parseTimeString(value);
  const timeValue = useMemo(() => new Time(hour, minute), [hour, minute]);

  return (
    <AriaTimeField
      value={timeValue}
      onChange={(next) => next != null && onChange(timeToHHmm(next))}
      hourCycle={12}
      granularity="minute"
      aria-label={ariaLabel ?? (label || "Selector de hora")}
      isInvalid={isInvalid}
      className={cn("flex min-w-0 flex-col gap-1", className)}
    >
      {label != null && (
        <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
          {label}
        </Label>
      )}
      <DateInput
        className={cn(
          "flex min-w-0 flex-shrink items-center gap-0.5 overflow-hidden rounded-[var(--radius-md)] border-[0.5px] bg-[var(--bg-input)] px-3 py-[10px] text-sm text-[var(--text-primary)] outline-none transition-colors",
          "border-[var(--border)] hover:border-[var(--border-strong)]",
          "focus-within:border-[var(--accent)]",
          isInvalid &&
            "border-[var(--error)] focus-within:border-[var(--error)]",
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className={cn(
              "inline rounded-[var(--radius-sm)] px-0.5 py-0.5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
              "focus:bg-[var(--accent-subtle)] focus:text-[var(--accent)]",
              "type-literal:min-w-[1.25rem] type-literal:text-center",
            )}
          />
        )}
      </DateInput>
    </AriaTimeField>
  );
}
