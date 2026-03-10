"use client";

import type { RoutineMetadata } from "@/app/lib/routines-api";
import { useTranslations } from "next-intl";
import { SkinProfileSelector } from "./skin-profile-selector";

interface RoutineToolbarProps {
  metadata: RoutineMetadata | null | undefined;
  onMetadataChange: (next: RoutineMetadata) => void;
}

export function RoutineToolbar({ metadata, onMetadataChange }: RoutineToolbarProps) {
  const t = useTranslations("routineBuilder");
  const safeMetadata = metadata ?? {};
  return (
    <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--app-fg)]">{t("routineContextTitle")}</h2>
          <p className="text-xs text-[var(--app-fg)]/60">
            {t("routineContextSubtitle")}
          </p>
        </div>
      </div>
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
