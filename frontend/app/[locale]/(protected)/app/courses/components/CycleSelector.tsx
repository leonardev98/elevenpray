"use client";

import { useMemo, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { cycleToRoman } from "@/app/lib/curriculum/curriculum-utils";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CycleFilter = number | "all" | "current";

interface CycleSelectorProps {
  value: CycleFilter;
  onChange: (value: CycleFilter) => void;
  cycleNumbers: number[];
  activeCycle: number;
  courseCountByCycle: Map<number, number>;
}

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1.5 py-px",
        "text-[11px] font-semibold tabular-nums leading-none",
        "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]",
      )}
    >
      {count}
    </span>
  );
}

interface SegmentProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function Segment({ active, onClick, children }: SegmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
      )}
    >
      {children}
    </button>
  );
}

export function CycleSelector({
  value,
  onChange,
  cycleNumbers,
  activeCycle,
  courseCountByCycle,
}: CycleSelectorProps) {
  const t = useTranslations("studentCourses");
  const activeRoman = cycleToRoman(activeCycle);

  const currentCount = courseCountByCycle.get(activeCycle) ?? 0;
  const totalCount = useMemo(
    () => [...courseCountByCycle.values()].reduce((sum, n) => sum + n, 0),
    [courseCountByCycle],
  );

  const otherCycles = useMemo(
    () => cycleNumbers.filter((n) => n !== activeCycle),
    [cycleNumbers, activeCycle],
  );

  const showCyclePicker = otherCycles.length > 0;
  const isSpecificCycle = typeof value === "number";
  const specificRoman = isSpecificCycle ? cycleToRoman(value) : null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={t("filterAriaLabel")}
    >
      <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/70 p-1 backdrop-blur-sm">
        <Segment active={value === "current"} onClick={() => onChange("current")}>
          {t("filterCurrentShort", { roman: activeRoman })}
          <CountBadge count={currentCount} />
        </Segment>
        <Segment active={value === "all"} onClick={() => onChange("all")}>
          {t("filterAllShort")}
          <CountBadge count={totalCount} />
        </Segment>
      </div>

      {showCyclePicker ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex h-[42px] items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35",
              isSpecificCycle
                ? "border-[var(--accent)]/40 bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg-surface))] text-[var(--text-primary)]"
                : "border-[var(--border)] bg-[var(--bg-elevated)]/70 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
            )}
          >
            <span>
              {isSpecificCycle && specificRoman
                ? t("filterCycleShort", { roman: specificRoman })
                : t("filterMoreCycles")}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="z-[6200] min-w-[11rem] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1 shadow-[var(--shadow-md)]"
          >
            {otherCycles.map((n) => {
              const selected = value === n;
              const count = courseCountByCycle.get(n) ?? 0;
              return (
                <DropdownMenuItem
                  key={n}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none",
                    "text-[var(--text-primary)] hover:bg-[var(--accent-subtle)] focus:bg-[var(--accent-subtle)]",
                    selected && "bg-[var(--accent-subtle)] text-[var(--accent)]",
                  )}
                  onClick={() => onChange(n)}
                >
                  <span>{t("filterCycleShort", { roman: cycleToRoman(n) })}</span>
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span className="text-xs tabular-nums">{count}</span>
                    {selected ? <Check className="h-4 w-4 text-[var(--accent)]" aria-hidden /> : null}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
