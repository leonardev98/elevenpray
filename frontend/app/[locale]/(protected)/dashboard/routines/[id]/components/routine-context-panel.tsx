"use client";

import type { RoutineMetadata } from "@/app/lib/routines-api";
import { useTranslations } from "next-intl";
import { SkinProfileSelector } from "./skin-profile-selector";

interface RoutineContextPanelProps {
  metadata: RoutineMetadata | null | undefined;
  onMetadataChange: (next: RoutineMetadata) => void;
}

export function RoutineContextPanel({ metadata, onMetadataChange }: RoutineContextPanelProps) {
  const t = useTranslations("routineBuilder");
  const safeMetadata = metadata ?? {};

  return (
    <section className="py-2">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/55">
        {t("routineContextTitle")}
      </p>
      <p className="mb-3 text-sm text-[var(--app-fg)]/65">
        {t("routineContextDescription")}
      </p>
      <SkinProfileSelector
        skinType={safeMetadata.skinType}
        complexity={safeMetadata.complexity}
        goals={safeMetadata.goals ?? []}
        onChange={(value) =>
          onMetadataChange({
            ...safeMetadata,
            skinType: value.skinType,
            complexity: value.complexity,
            goals: value.goals,
          })
        }
      />
    </section>
  );
}
