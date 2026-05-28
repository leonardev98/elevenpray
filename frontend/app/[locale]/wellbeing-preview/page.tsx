"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { WellbeingPageContent } from "../(protected)/app/wellbeing/components/WellbeingPageContent";

export default function WellbeingPreviewPage() {
  const t = useTranslations("studentWellbeing");

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[var(--app-primary)]" />
              <div>
                <h1 className="text-xl font-bold text-[var(--app-fg)]">{t("previewBannerTitle")}</h1>
                <p className="text-sm text-[var(--app-fg-muted)]">{t("previewBannerDesc")}</p>
              </div>
            </div>
            <div className="shrink-0 rounded-xl bg-[var(--app-primary)]/10 px-4 py-2">
              <p className="text-xs font-semibold text-[var(--app-primary)]">{t("previewMode")}</p>
            </div>
          </div>
        </div>

        <WellbeingPageContent bare showDisclaimer={false} />

        <p className="mt-6 text-center text-xs text-[var(--app-fg-muted)]/70">
          {t("previewDisclaimer")}
        </p>
      </div>
    </div>
  );
}
