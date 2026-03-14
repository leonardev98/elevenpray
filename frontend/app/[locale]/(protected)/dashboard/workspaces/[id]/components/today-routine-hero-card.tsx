"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { fadeInUp, hoverCard } from "@/lib/animations";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";
import type { Routine } from "../../../../../../lib/routines-api";
import {
  getTodayDayKey,
  getTodayStepsBySlot,
  getCompletedStepIds,
  toggleStepCompleted,
} from "../../../../../../lib/skincare-routine-progress";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TodayRoutineHeroCardProps {
  workspaceId: string;
  onRoutineComplete?: () => void;
}

export function TodayRoutineHeroCard({ workspaceId, onRoutineComplete }: TodayRoutineHeroCardProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const [template, setTemplate] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const dayKey = getTodayDayKey();
  const { am: amSteps, pm: pmSteps } = getTodayStepsBySlot(template, dayKey);
  const allSteps = [...amSteps, ...pmSteps];
  const totalSteps = allSteps.length;
  const completedCount = completedIds.filter((id) => allSteps.some((s) => s.id === id)).length;
  const percent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  useEffect(() => {
    if (!token || !workspaceId) return;
    getRoutineTemplatesByWorkspace(token, workspaceId)
      .then((list: unknown[]) => {
        const templates = list as Routine[];
        const defaultTemplate = templates.find((r) => r.year === 0 && r.weekNumber === 0) ?? null;
        setTemplate(defaultTemplate);
      })
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  useEffect(() => {
    setCompletedIds(getCompletedStepIds(workspaceId));
  }, [workspaceId]);

  const handleToggleStep = useCallback(
    (stepId: string) => {
      const next = toggleStepCompleted(workspaceId, stepId);
      setCompletedIds(next);
      const newCompleted = next.filter((id) => allSteps.some((s) => s.id === id)).length;
      if (totalSteps > 0 && newCompleted === totalSteps && onRoutineComplete) {
        onRoutineComplete();
      }
    },
    [workspaceId, allSteps, totalSteps, onRoutineComplete]
  );

  const base = `/dashboard/workspaces/${workspaceId}`;

  if (loading) {
    return (
      <section
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-sm"
        aria-label={t("todayRoutine")}
      >
        <div className="text-sm text-zinc-400 dark:text-slate-300">
          {t("loadingRoutine")}
        </div>
      </section>
    );
  }

  const hasRoutine = totalSteps > 0;

  return (
    <motion.section
      className="rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface)] to-[var(--app-bg)] p-6 sm:p-8 shadow-lg"
      aria-labelledby="hero-today-routine-heading"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
      whileHover={hoverCard}
    >
      <h2
        id="hero-today-routine-heading"
        className="text-xl font-semibold tracking-normal text-[var(--app-fg)] dark:text-zinc-200"
      >
        {t("todayRoutine")}
      </h2>
      <p className="mt-1 text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
        {hasRoutine ? t("hubRoutineMorningNight") : t("noRoutineConfigured")}
      </p>

      {hasRoutine ? (
        <>
          <div className="mt-6 space-y-6">
            {amSteps.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--app-fg)]/70 dark:text-slate-400">
                  {t("routineAm")}
                </h3>
                <ul className="space-y-2" aria-label={t("todaySteps")}>
                  {amSteps.map((step) => {
                    const done = completedIds.includes(step.id);
                    return (
                      <li
                        key={step.id}
                        className="flex items-center gap-3 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--app-navy)]/50 transition-all hover:border-[var(--app-navy)] hover:bg-[var(--app-navy)]/10"
                          aria-pressed={done}
                          aria-label={done ? t("stepCompleted") : t("markStepComplete")}
                        >
                          {done ? (
                            <Check className="h-4 w-4 text-[var(--app-navy)]" strokeWidth={2.5} />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-transparent" />
                          )}
                        </button>
                        <span className={done ? "text-[var(--app-fg)]/70 line-through dark:text-slate-400" : ""}>
                          {step.content || step.stepType || "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {pmSteps.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--app-fg)]/70 dark:text-slate-400">
                  {t("routinePm")}
                </h3>
                <ul className="space-y-2" aria-label={t("todaySteps")}>
                  {pmSteps.map((step) => {
                    const done = completedIds.includes(step.id);
                    return (
                      <li
                        key={step.id}
                        className="flex items-center gap-3 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStep(step.id)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--app-navy)]/50 transition-all hover:border-[var(--app-navy)] hover:bg-[var(--app-navy)]/10"
                          aria-pressed={done}
                          aria-label={done ? t("stepCompleted") : t("markStepComplete")}
                        >
                          {done ? (
                            <Check className="h-4 w-4 text-[var(--app-navy)]" strokeWidth={2.5} />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-transparent" />
                          )}
                        </button>
                        <span className={done ? "text-[var(--app-fg)]/70 line-through dark:text-slate-400" : ""}>
                          {step.content || step.stepType || "—"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--app-fg)]/80 dark:text-slate-300">
              <span>{t("percentCompleted", { percent })}</span>
              <span>{percent}%</span>
            </div>
            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--app-bg)] dark:bg-zinc-700"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[var(--app-navy)] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="mt-8">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`${base}/routine`}>{t("startRoutine")}</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <Button asChild size="lg" variant="default" className="w-full sm:w-auto">
            <Link href={`${base}/routine`}>{t("buildRoutine")}</Link>
          </Button>
        </div>
      )}
    </motion.section>
  );
}
