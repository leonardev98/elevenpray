"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkspaceCheckinApi } from "../../../../../../lib/workspace-checkins-api";

interface SkinProgressChartProps {
  checkins: WorkspaceCheckinApi[];
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "Z");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function SkinProgressChart({ checkins }: SkinProgressChartProps) {
  const t = useTranslations("workspaceNav");
  const tChart = useTranslations("skinChart");

  const data = useMemo(() => {
    const sorted = [...checkins].sort(
      (a, b) =>
        new Date(a.checkinDate).getTime() - new Date(b.checkinDate).getTime()
    );
    return sorted.slice(-14).map((c) => ({
      date: c.checkinDate,
      label: formatShortDate(c.checkinDate),
      hydration: c.data?.hydration ?? null,
      acne: c.data?.acne != null ? 5 - (c.data.acne as number) : null,
      irritation: c.data?.irritation != null ? 5 - (c.data.irritation as number) : null,
    }));
  }, [checkins]);

  const hasData = data.some(
    (d) => d.hydration != null || d.acne != null || d.irritation != null
  );

  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-[var(--app-fg)]">
          {tChart("title")}
        </h3>
        <p className="text-xs text-[var(--app-fg)]/70">{tChart("subtitle")}</p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="py-6 text-center text-sm text-[var(--app-fg)]/60">
            {tChart("noData")}
          </p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--app-border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--app-fg)" }}
                  stroke="var(--app-border)"
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "var(--app-fg)" }}
                  stroke="var(--app-border)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--app-fg)" }}
                  formatter={(value: unknown) =>
                  typeof value === "number" && !Number.isNaN(value)
                    ? value.toFixed(1)
                    : "—"}
                  labelFormatter={(label) => label}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => tChart(value as "hydration" | "acne" | "irritation")}
                />
                {data.some((d) => d.hydration != null) && (
                  <Line
                    type="monotone"
                    dataKey="hydration"
                    stroke="var(--app-navy)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                )}
                {data.some((d) => d.acne != null) && (
                  <Line
                    type="monotone"
                    dataKey="acne"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                )}
                {data.some((d) => d.irritation != null) && (
                  <Line
                    type="monotone"
                    dataKey="irritation"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
