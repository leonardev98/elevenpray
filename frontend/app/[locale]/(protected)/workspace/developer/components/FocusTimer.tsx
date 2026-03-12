"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const POMODORO_MINUTES = 25;
const TOTAL_SECONDS = POMODORO_MINUTES * 60;

interface FocusTimerProps {
  className?: string;
}

export function FocusTimer({ className }: FocusTimerProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          return TOTAL_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.08 }}
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-5 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="text-[length:var(--dev-font-display-size)] font-medium tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)]">
        {t("focusTimer")}
      </h2>
      <p
        className="mt-0.5 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
        style={{ opacity: "var(--dev-font-meta-opacity)" }}
      >
        {t("deepWorkMode")}
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-navy)]/10">
          <span
            className="text-2xl font-light tabular-nums text-[var(--app-navy)]"
            style={{ letterSpacing: "var(--dev-font-display-tracking)" }}
          >
            {display}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-bg)] px-4 py-2.5 text-[length:var(--dev-font-body-size)] font-medium text-[var(--app-fg)] transition-colors hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)]"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t("startFocus")}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(TOTAL_SECONDS);
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)] transition-colors hover:text-[var(--app-fg)]"
            style={{ opacity: 0.7 }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
      <p
        className="mt-3 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
        style={{ opacity: 0.5 }}
      >
        {POMODORO_MINUTES} {t("minutes")} · Descanso recomendado después
      </p>
    </motion.section>
  );
}
