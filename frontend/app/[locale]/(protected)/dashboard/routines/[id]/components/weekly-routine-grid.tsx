"use client";

import { motion } from "framer-motion";
import type { DayContent } from "@/app/lib/routines-api";
import type { DayKey } from "@/app/lib/routine-builder";
import { DAY_KEYS } from "@/app/lib/routine-builder";
import { RoutineDayCard } from "./routine-day-card";

interface WeeklyRoutineGridProps {
  days: Record<string, DayContent>;
  intentLabels: Partial<Record<DayKey, string>>;
  dayNameByKey: (day: DayKey) => string;
  onUpdateDay: (dayKey: DayKey, next: DayContent) => void;
  onOpenAddProduct: (dayKey: DayKey, groupId: string, slot: "am" | "pm") => void;
}

export function WeeklyRoutineGrid({
  days,
  intentLabels,
  dayNameByKey,
  onUpdateDay,
  onOpenAddProduct,
}: WeeklyRoutineGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
      {DAY_KEYS.map((dayKey, index) => (
        <motion.div
          key={dayKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="min-w-0"
        >
          <RoutineDayCard
            dayKey={dayKey}
            dayLabel={dayNameByKey(dayKey)}
            day={days[dayKey] ?? { groups: [] }}
            intentLabel={intentLabels[dayKey]}
            onUpdateDay={(next) => onUpdateDay(dayKey, next)}
            onOpenAddProduct={(groupId, slot) => onOpenAddProduct(dayKey, groupId, slot)}
          />
        </motion.div>
      ))}
    </section>
  );
}
