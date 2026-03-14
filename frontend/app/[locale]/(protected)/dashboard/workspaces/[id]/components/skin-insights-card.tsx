"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Lightbulb, AlertTriangle, ChevronRight } from "lucide-react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";
import { getWorkspaceProducts } from "../../../../../../lib/workspace-products-api";
import { checkIngredientConflicts } from "../../../../../../lib/ingredient-conflicts-api";
import { analyzeRoutineIntelligence } from "../../../../../../lib/routine-builder/routine-analyzer";
import type { Routine } from "../../../../../../lib/routines-api";

interface SkinInsightsCardProps {
  workspaceId: string;
  photosCount?: number;
}

interface InsightLine {
  id: string;
  text: string;
  type: "warning" | "recommendation" | "positive";
}

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const out = t(key);
    return typeof out === "string" && out ? out : fallback;
  } catch {
    return fallback;
  }
}

export function SkinInsightsCard({ workspaceId, photosCount = 0 }: SkinInsightsCardProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tBuilder = useTranslations("routineBuilder");
  const [insights, setInsights] = useState<InsightLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    Promise.all([
      getRoutineTemplatesByWorkspace(token, workspaceId),
      getWorkspaceProducts(token, workspaceId),
    ])
      .then(([templates, products]) => {
        const template = (templates as Routine[]).find((r) => r.year === 0 && r.weekNumber === 0) ?? null;
        if (!template?.days) {
          setInsights([]);
          setLoading(false);
          return;
        }
        const allIngredients = (products as { mainIngredients?: string[] | null }[])
          .flatMap((p) => p.mainIngredients ?? [])
          .filter(Boolean) as string[];
        const uniqueIngredients = [...new Set(allIngredients)];
        checkIngredientConflicts(token, uniqueIngredients)
          .then((conflicts) => {
            const result = analyzeRoutineIntelligence(
              template,
              products as Parameters<typeof analyzeRoutineIntelligence>[1],
              conflicts
            );
            const lines: InsightLine[] = [];
            const added = new Set<string>();
            for (const w of result.warnings) {
              const msg = w.messageKey ? safeT(tBuilder, w.messageKey, w.message ?? "") : w.message ?? "";
              if (msg && !added.has(w.id)) {
                added.add(w.id);
                lines.push({ id: w.id, text: msg, type: "warning" });
              }
            }
            for (const c of result.conflicts) {
              const msg = c.messageKey ? safeT(tBuilder, c.messageKey, c.message ?? "") : c.message ?? "";
              if (msg && !added.has(c.id)) {
                added.add(c.id);
                lines.push({ id: c.id, text: msg, type: "warning" });
              }
            }
            for (const r of result.recommendations) {
              const msg = r.messageKey ? safeT(tBuilder, r.messageKey, r.message ?? "") : r.message ?? "";
              if (msg && !added.has(r.id)) {
                added.add(r.id);
                lines.push({ id: r.id, text: msg, type: "recommendation" });
              }
            }
            if (photosCount >= 2 && !added.has("improvement-visible")) {
              lines.push({
                id: "improvement-visible",
                text: t("insightImprovementVisible"),
                type: "positive",
              });
            }
            setInsights(lines.slice(0, 5));
          })
          .catch(() => setInsights([]))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        setInsights([]);
        setLoading(false);
      });
  }, [token, workspaceId, photosCount]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md dark:border-zinc-700"
      aria-labelledby="skin-insights-card-heading"
    >
      <h2
        id="skin-insights-card-heading"
        className="mb-4 flex items-center gap-2 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" aria-hidden />
        {t("insightsForYourSkin")}
      </h2>
      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60 dark:text-slate-400">{t("loadingInsights")}</p>
      ) : insights.length === 0 ? (
        <p className="text-sm text-[var(--app-fg)]/80 dark:text-slate-300">{t("noInsightsYet")}</p>
      ) : (
        <ul className="space-y-2">
          {insights.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 rounded-lg bg-[var(--app-bg)]/60 px-3 py-2 text-sm dark:bg-zinc-800/60"
            >
              {item.type === "warning" && (
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
              )}
              <span className="text-[var(--app-fg)]/90 dark:text-slate-300">{item.text}</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`${base}/insights`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--app-navy)] transition hover:underline dark:text-sky-400"
      >
        {t("viewInsights")}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
