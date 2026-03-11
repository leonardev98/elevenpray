"use client";

import { useTranslations } from "next-intl";
import { Wrench, Sparkles, Repeat, Package } from "lucide-react";

interface AutoBuildRoutineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: "scratch" | "smart-starter" | "skin-cycling" | "product-first") => void;
}

const OPTION_KEYS: Array<{
  id: "scratch" | "smart-starter" | "skin-cycling" | "product-first";
  titleKey: string;
  descKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "scratch", titleKey: "buildFromScratch", descKey: "buildFromScratchDesc", Icon: Wrench },
  { id: "smart-starter", titleKey: "smartStarterRoutine", descKey: "smartStarterRoutineDesc", Icon: Sparkles },
  { id: "skin-cycling", titleKey: "skinCyclingTemplate", descKey: "skinCyclingTemplateDesc", Icon: Repeat },
  { id: "product-first", titleKey: "productFirstBuilder", descKey: "productFirstBuilderDesc", Icon: Package },
];

export function AutoBuildRoutineDialog({ isOpen, onClose, onSelectMode }: AutoBuildRoutineDialogProps) {
  const t = useTranslations("routineBuilder");
  const tCommon = useTranslations("common");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[900px] rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[var(--app-fg)]">{t("autoBuildRoutineTitle")}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-[var(--app-fg)]/55 hover:bg-[var(--app-bg)]">
            {tCommon("close")}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {OPTION_KEYS.map(({ id, titleKey, descKey, Icon }) => (
            <div
              key={id}
              className="flex flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-6 transition hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-navy)]/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--app-navy)]/10 text-[var(--app-navy)]">
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="text-base font-semibold text-[var(--app-fg)]">{t(titleKey)}</h4>
              <p className="mt-2 flex-1 text-sm text-[var(--app-fg)]/70">{t(descKey)}</p>
              <button
                type="button"
                onClick={() => onSelectMode(id)}
                className="mt-4 w-fit rounded-xl border border-[var(--app-navy)]/40 bg-[var(--app-navy)]/10 px-4 py-2.5 text-sm font-medium text-[var(--app-navy)] transition hover:bg-[var(--app-navy)]/20"
              >
                {t("useThisOption")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
