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
        <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
          {label}
        </Label>
      )}
      <DateInput
        className={cn(
          "flex min-w-0 flex-shrink items-center gap-0.5 overflow-hidden rounded-xl border bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition",
          "border-white/20 hover:border-white/40",
          "focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/40",
          isInvalid &&
            "border-red-500/60 focus-within:border-red-500/60 focus-within:ring-red-500/40",
        )}
      >
        {(segment) => (
          <DateSegment
            segment={segment}
            className={cn(
              "inline rounded px-0.5 py-0.5 text-white outline-none placeholder:text-white/40",
              "focus:bg-white/10 focus:caret-white",
              "type-literal:min-w-[1.25rem] type-literal:text-center",
            )}
          />
        )}
      </DateInput>
    </AriaTimeField>
  );
}
