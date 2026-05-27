"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import type { CurriculumCourse, CurriculumStats } from "@/app/lib/curriculum/types";
import { estimateGraduationCycles } from "@/app/lib/curriculum/curriculum-utils";

interface MallaStatsPanelProps {
  stats: CurriculumStats;
  courses: CurriculumCourse[];
}

export function MallaStatsPanel({ stats, courses }: MallaStatsPanelProps) {
  const t = useTranslations("studentMalla");

  const suggestions = useMemo(() => {
    const result: CurriculumCourse[] = [];
    for (const c of courses) {
      if (c.status !== "pending" || c.isUnlocked) continue;
      const missing = c.prerequisiteIds.filter((id) => {
        const p = courses.find((x) => x.id === id);
        return p && p.status !== "approved";
      });
      if (missing.length === 1) result.push(c);
    }
    return result.slice(0, 5);
  }, [courses]);

  const projection = estimateGraduationCycles(
    stats.approvedCredits,
    stats.totalCredits,
    stats.cyclesWithCourses,
    stats.approvedCount,
  );

  return (
    <aside className="sticky top-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]">
          {t("progressGlobal")}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-20 w-20 shrink-0">
            <CircularProgressbar
              value={stats.progressPercent}
              text={`${stats.progressPercent}%`}
              styles={buildStyles({
                textSize: "22px",
                pathColor: "var(--accent)",
                textColor: "var(--text-primary)",
                trailColor: "var(--border)",
              })}
            />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-[var(--text-primary)]">
              {t("creditsApproved", {
                approved: stats.approvedCredits,
                total: stats.totalCredits,
              })}
            </p>
            <ul className="mt-2 space-y-0.5 text-xs text-[var(--text-body)]">
              <li>
                <span className="font-medium text-[var(--malla-status-approved-fg)]">
                  {t("status_approved")}
                </span>
                : {stats.approvedCount}
              </li>
              <li>
                <span className="font-medium text-[var(--malla-status-progress-fg)]">
                  {t("status_in_progress")}
                </span>
                : {stats.inProgressCount}
              </li>
              <li>
                <span className="font-medium text-[var(--malla-status-pending-fg)]">
                  {t("status_pending")}
                </span>
                : {stats.pendingCount}
              </li>
              {stats.failedCount > 0 && (
                <li>
                  <span className="font-medium text-[var(--malla-status-failed-fg)]">
                    {t("status_failed")}
                  </span>
                  : {stats.failedCount}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <p className="text-xs leading-relaxed text-[var(--text-body)]">
          {projection != null ? t("projection", { cycles: projection }) : t("projectionUnknown")}
        </p>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]">
          {t("suggestions")}
        </p>
        {suggestions.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--text-body)]">{t("suggestionsEmpty")}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {suggestions.map((c) => (
              <li
                key={c.id}
                className="rounded-lg bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-primary)]"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
