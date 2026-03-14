"use client";

import { useTranslations } from "next-intl";
import { Construction } from "lucide-react";

interface UnderConstructionOverlayProps {
  children: React.ReactNode;
}

export function UnderConstructionOverlay({ children }: UnderConstructionOverlayProps) {
  const t = useTranslations("underConstruction");

  return (
    <div className="relative min-h-[60vh]">
      {/* Contenido existente (visible pero detrás del overlay) */}
      <div className="min-h-[60vh]">{children}</div>

      {/* Overlay con blur encima del contenido */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 backdrop-blur-md bg-[var(--app-bg)]/70 dark:bg-black/50"
        aria-modal="true"
        role="dialog"
        aria-labelledby="under-construction-heading"
      >
        <div
          className="relative w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]/95 shadow-2xl shadow-black/10 dark:shadow-black/30 p-8 text-center"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px var(--app-border)",
          }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-navy)]/10 text-[var(--app-navy)]">
            <Construction className="h-8 w-8" aria-hidden />
          </div>
          <h2
            id="under-construction-heading"
            className="text-xl font-semibold tracking-tight text-[var(--app-fg)]"
          >
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-[var(--app-fg)]/75">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
