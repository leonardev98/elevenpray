"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  createWorkspaceCheckin,
  type CheckinData,
  type SkinCheckinSymptom,
} from "../../../../../../lib/workspace-checkins-api";
import { toast } from "@/app/lib/toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SLIDER_KEYS = [
  "hydration",
  "oiliness",
  "irritation",
  "sensitivity",
  "acne",
  "texture",
] as const;

const SYMPTOM_KEYS: SkinCheckinSymptom[] = [
  "tirantez",
  "brotes",
  "rojez",
  "descamacion",
  "manchas_nuevas",
];

function SliderRow({
  label,
  value,
  onChange,
  reverse,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  reverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="min-w-[7rem] text-xs font-medium text-[var(--app-fg)]/80">
        {label}
      </label>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-2 flex-1 appearance-none rounded-full",
          "bg-[var(--app-border)] accent-[var(--app-navy)]",
          "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-[var(--app-navy)] [&::-webkit-slider-thumb]:shadow-sm"
        )}
      />
      <span className="w-5 text-right text-xs tabular-nums text-[var(--app-fg)]/70">
        {reverse ? 6 - value : value}
      </span>
    </div>
  );
}

/** Zonas del mapa facial para incluir en el check-in */
export interface SkinCheckinFaceMapZone {
  zone: string;
  type: string;
  severity: number;
}

interface SkinCheckinCardProps {
  workspaceId: string;
  onSaved: () => void;
  initialData?: Partial<CheckinData> | null;
  /** Zonas del mapa facial a guardar con el check-in */
  faceMapZones?: SkinCheckinFaceMapZone[];
}

export function SkinCheckinCard({
  workspaceId,
  onSaved,
  initialData,
  faceMapZones = [],
}: SkinCheckinCardProps) {
  const { token } = useAuth();
  const tSkin = useTranslations("skinCheckin");

  const [hydration, setHydration] = useState(initialData?.hydration ?? 3);
  const [oiliness, setOiliness] = useState(initialData?.oiliness ?? 3);
  const [irritation, setIrritation] = useState(initialData?.irritation ?? 1);
  const [sensitivity, setSensitivity] = useState(initialData?.sensitivity ?? 2);
  const [acne, setAcne] = useState(initialData?.acne ?? 1);
  const [texture, setTexture] = useState(initialData?.texture ?? 3);
  const [symptoms, setSymptoms] = useState<SkinCheckinSymptom[]>(
    (initialData?.symptoms as SkinCheckinSymptom[] | undefined) ?? []
  );
  const [notes, setNotes] = useState(initialData?.freeNotes ?? "");
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (s: SkinCheckinSymptom) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const data: CheckinData = {
        hydration,
        oiliness,
        irritation,
        sensitivity,
        acne,
        texture,
        symptoms: symptoms.length ? symptoms : undefined,
        freeNotes: notes.trim() || undefined,
        faceMapZones: faceMapZones.length ? faceMapZones : undefined,
      };
      await createWorkspaceCheckin(token, workspaceId, {
        checkinDate: new Date().toISOString().slice(0, 10),
        data: Object.keys(data).length ? data : null,
      });
      toast.success(tSkin("savedTitle"), tSkin("savedDescription"));
      onSaved();
    } catch {
      toast.error(tSkin("errorTitle"), tSkin("errorDescription"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-[var(--app-fg)]">
          {tSkin("title")}
        </h3>
        <p className="text-xs text-[var(--app-fg)]/70">{tSkin("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <SliderRow
              label={tSkin("hydration")}
              value={hydration}
              onChange={setHydration}
            />
            <SliderRow
              label={tSkin("oiliness")}
              value={oiliness}
              onChange={setOiliness}
              reverse
            />
            <SliderRow
              label={tSkin("irritation")}
              value={irritation}
              onChange={setIrritation}
              reverse
            />
            <SliderRow
              label={tSkin("sensitivity")}
              value={sensitivity}
              onChange={setSensitivity}
              reverse
            />
            <SliderRow
              label={tSkin("acne")}
              value={acne}
              onChange={setAcne}
              reverse
            />
            <SliderRow
              label={tSkin("texture")}
              value={texture}
              onChange={setTexture}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--app-fg)]/80">
              {tSkin("symptoms")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_KEYS.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    symptoms.includes(key)
                      ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                      : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-fg)]/70 hover:border-[var(--app-navy)]/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(key)}
                    onChange={() => toggleSymptom(key)}
                    className="sr-only"
                  />
                  {tSkin(`symptom_${key}`)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/80">
              {tSkin("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={tSkin("notesPlaceholder")}
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? tSkin("saving") : tSkin("save")}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
