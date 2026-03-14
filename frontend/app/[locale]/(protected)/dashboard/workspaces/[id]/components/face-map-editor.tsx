"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Stage, Layer, Circle, Group } from "react-konva";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FaceZoneKey =
  | "forehead"
  | "left_cheek"
  | "right_cheek"
  | "nose"
  | "chin"
  | "jaw";

export type FaceZoneType = "acne" | "manchas" | "irritacion" | "sequedad";

export interface FaceMapZoneValue {
  zone: FaceZoneKey;
  type: FaceZoneType;
  severity: number;
}

const ZONE_COLORS: Record<FaceZoneType, string> = {
  acne: "#ef4444",
  manchas: "#a855f7",
  irritacion: "#eab308",
  sequedad: "#0ea5e9",
};

const ZONE_POSITIONS: { key: FaceZoneKey; x: number; y: number; r: number }[] = [
  { key: "forehead", x: 100, y: 45, r: 28 },
  { key: "left_cheek", x: 55, y: 95, r: 22 },
  { key: "right_cheek", x: 145, y: 95, r: 22 },
  { key: "nose", x: 100, y: 105, r: 18 },
  { key: "chin", x: 100, y: 145, r: 20 },
  { key: "jaw", x: 100, y: 170, r: 25 },
];

interface FaceMapEditorProps {
  zones: FaceMapZoneValue[];
  onChange: (zones: FaceMapZoneValue[]) => void;
  /** Si no hay fotos, se puede ocultar o mostrar igual */
  showWhenEmpty?: boolean;
}

export function FaceMapEditor({
  zones,
  onChange,
  showWhenEmpty = true,
}: FaceMapEditorProps) {
  const t = useTranslations("faceMap");
  const [selected, setSelected] = useState<FaceZoneKey | null>(null);

  const getZone = useCallback(
    (key: FaceZoneKey) => zones.find((z) => z.zone === key),
    [zones]
  );

  const handleZoneClick = useCallback(
    (key: FaceZoneKey) => {
      setSelected(key);
      const current = getZone(key);
      if (!current) {
        onChange([
          ...zones.filter((z) => z.zone !== key),
          { zone: key, type: "acne", severity: 1 },
        ]);
      }
    },
    [zones, onChange, getZone]
  );

  const updateSelectedZone = useCallback(
    (type: FaceZoneType, severity: number) => {
      if (!selected) return;
      onChange([
        ...zones.filter((z) => z.zone !== selected),
        { zone: selected, type, severity },
      ]);
    },
    [selected, zones, onChange]
  );

  const clearZone = useCallback(
    (key: FaceZoneKey) => {
      onChange(zones.filter((z) => z.zone !== key));
      setSelected(null);
    },
    [zones, onChange]
  );

  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-[var(--app-fg)]">
          {t("title")}
        </h3>
        <p className="text-xs text-[var(--app-fg)]/70">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <div
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-2"
            style={{ width: 220, height: 220 }}
          >
            <Stage width={200} height={200}>
              <Layer>
                {/* Contorno de cara simplificado */}
                <Group>
                  <Circle
                    x={100}
                    y={100}
                    radius={95}
                    stroke="var(--app-border)"
                    strokeWidth={1.5}
                    fill="transparent"
                    listening={false}
                  />
                </Group>
                {ZONE_POSITIONS.map(({ key, x, y, r }) => {
                  const value = getZone(key);
                  const isSelected = selected === key;
                  return (
                    <Circle
                      key={key}
                      x={x}
                      y={y}
                      radius={r}
                      fill={
                        value
                          ? ZONE_COLORS[value.type]
                          : "var(--app-bg)"
                      }
                      opacity={value ? 0.6 : 0.3}
                      stroke={isSelected ? "var(--app-navy)" : "var(--app-border)"}
                      strokeWidth={isSelected ? 2.5 : 1}
                      onClick={() => handleZoneClick(key)}
                      onTap={() => handleZoneClick(key)}
                    />
                  );
                })}
              </Layer>
            </Stage>
          </div>

          {selected && (
            <div className="mt-3 w-full space-y-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-3">
              <p className="text-xs font-medium text-[var(--app-fg)]/80">
                {t("zone")}: {t(`zone_${selected}`)}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  ["acne", "manchas", "irritacion", "sequedad"] as FaceZoneType[]
                ).map((type) => {
                  const current = getZone(selected);
                  const active = current?.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        updateSelectedZone(type, current?.severity ?? 1)
                      }
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition",
                        active
                          ? "bg-[var(--app-navy)] text-white"
                          : "bg-[var(--app-surface)] text-[var(--app-fg)]/70 hover:bg-[var(--app-border)]"
                      )}
                    >
                      {t(`type_${type}`)}
                    </button>
                  );
                })}
              </div>
              {getZone(selected) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--app-fg)]/70">
                    {t("severity")}:
                  </span>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        updateSelectedZone(
                          getZone(selected)!.type,
                          s
                        )
                      }
                      className={cn(
                        "h-7 w-7 rounded-full text-xs font-medium transition",
                        getZone(selected)?.severity === s
                          ? "bg-[var(--app-navy)] text-white"
                          : "bg-[var(--app-surface)] text-[var(--app-fg)]/70"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => clearZone(selected)}
                className="text-xs text-red-600 hover:underline"
              >
                {t("clearZone")}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
