"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DayContent } from "@/app/lib/routines-api";
import type { DayKey, ItemSeverityReason } from "@/app/lib/routine-builder";
import { DAY_KEYS } from "@/app/lib/routine-builder";
import { RoutineDayCard } from "./routine-day-card";

const CARD_WIDTH = 320;
const GAP = 24;
const STEP = CARD_WIDTH + GAP;

interface WeeklyRoutineGridProps {
  days: Record<string, DayContent>;
  intentLabels: Partial<Record<DayKey, string>>;
  dayNameByKey: (day: DayKey) => string;
  onUpdateDay: (dayKey: DayKey, next: DayContent) => void;
  onEditStep?: (dayKey: DayKey, slot: "am" | "pm", itemId: string) => void;
  /** Map itemId -> severity for visual feedback (warning = yellow, conflict = red). */
  itemSeverityMap?: Record<string, "warning" | "conflict">;
  /** Map itemId -> reason for severity (hover tooltip). */
  itemSeverityReasonsMap?: Record<string, ItemSeverityReason>;
}

export function WeeklyRoutineGrid({
  days,
  intentLabels,
  dayNameByKey,
  onUpdateDay,
  onEditStep,
  itemSeverityMap = {},
  itemSeverityReasonsMap = {},
}: WeeklyRoutineGridProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const t = useTranslations("routineBuilder");
  const tDays = useTranslations("days");

  const goPrev = useCallback(() => {
    setScrollIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setScrollIndex((i) => Math.min(DAY_KEYS.length - 1, i + 1));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchStartX.current = null;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current == null) return;
      const endX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - endX;
      const threshold = 50;
      if (diff > threshold) setScrollIndex((i) => Math.min(DAY_KEYS.length - 1, i + 1));
      else if (diff < -threshold) setScrollIndex((i) => Math.max(0, i - 1));
      touchStartX.current = null;
    },
    []
  );

  const translateX = -scrollIndex * STEP;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={scrollIndex === 0}
          aria-label={t("carouselPrevDay")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-elevated)] text-[var(--app-fg)] transition hover:bg-[var(--app-surface-elevated)]/80 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
          {DAY_KEYS.map((dayKey, index) => (
            <button
              key={dayKey}
              type="button"
              onClick={() => setScrollIndex(index)}
              className={`rounded-lg px-2 py-1.5 text-sm font-medium transition sm:px-3 ${
                scrollIndex === index
                  ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)] hover:text-[var(--app-fg)]"
              }`}
            >
              {tDays(dayKey)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={scrollIndex === DAY_KEYS.length - 1}
          aria-label={t("carouselNextDay")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-elevated)] text-[var(--app-fg)] transition hover:bg-[var(--app-surface-elevated)]/80 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex pb-4"
          style={{ gap: GAP }}
          animate={{ x: translateX }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        >
          {DAY_KEYS.map((dayKey, index) => (
            <motion.div
              key={dayKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="shrink-0"
              style={{ width: CARD_WIDTH }}
            >
              <RoutineDayCard
                dayKey={dayKey}
                dayLabel={dayNameByKey(dayKey)}
                day={days[dayKey] ?? { groups: [] }}
                intentLabel={intentLabels[dayKey]}
                onUpdateDay={(next) => onUpdateDay(dayKey, next)}
                onEditStep={(slot, itemId) => onEditStep?.(dayKey, slot, itemId)}
                itemSeverityMap={itemSeverityMap}
                itemSeverityReasonsMap={itemSeverityReasonsMap}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
