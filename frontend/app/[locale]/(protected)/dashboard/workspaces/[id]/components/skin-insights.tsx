"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkspaceCheckinApi } from "../../../../../../lib/workspace-checkins-api";

interface SkinInsightsProps {
  checkins: WorkspaceCheckinApi[];
}

interface Insight {
  id: string;
  text: string;
  type: "warning" | "recommendation" | "positive";
}

export function SkinInsights({ checkins }: SkinInsightsProps) {
  const t = useTranslations("skinInsights");

  const insights = useMemo(() => {
    const list: Insight[] = [];
    const recent = checkins
      .slice()
      .sort(
        (a, b) =>
          new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
      )
      .slice(0, 7);

    const acneValues = recent
      .map((c) => c.data?.acne as number | undefined)
      .filter((v): v is number => typeof v === "number");
    const irritationValues = recent
      .map((c) => c.data?.irritation as number | undefined)
      .filter((v): v is number => typeof v === "number");
    const hydrationValues = recent
      .map((c) => c.data?.hydration as number | undefined)
      .filter((v): v is number => typeof v === "number");

    if (acneValues.length >= 3 && acneValues.every((v) => v >= 3)) {
      list.push({
        id: "acne-persistent",
        text: t("acnePersistent"),
        type: "warning",
      });
    }
    if (irritationValues.length >= 3 && irritationValues.every((v) => v >= 3)) {
      list.push({
        id: "irritation-high",
        text: t("irritationHigh"),
        type: "warning",
      });
    }
    if (
      hydrationValues.length >= 3 &&
      hydrationValues.every((v) => v <= 2)
    ) {
      list.push({
        id: "hydration-low",
        text: t("hydrationLow"),
        type: "recommendation",
      });
    }
    if (list.length === 0 && recent.length > 0) {
      list.push({
        id: "keep-tracking",
        text: t("keepTracking"),
        type: "positive",
      });
    }
    return list.slice(0, 5);
  }, [checkins, t]);

  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader className="pb-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--app-fg)]">
          <Lightbulb className="h-4 w-4 text-amber-500" aria-hidden />
          {t("title")}
        </h3>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-[var(--app-fg)]/70">{t("noData")}</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-lg bg-[var(--app-bg)]/60 px-3 py-2 text-sm"
              >
                {item.type === "warning" && (
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
                    aria-hidden
                  />
                )}
                <span className="text-[var(--app-fg)]/90">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
