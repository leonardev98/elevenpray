"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Sparkles, TrendingUp, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MessageSquareHeart } from "lucide-react";

const INSIGHT_ICONS: LucideIcon[] = [TrendingUp, Moon, MessageSquareHeart];
const LIZYY_IMAGE_URL =
  "https://mitsyy-bucket.s3.us-east-2.amazonaws.com/lizyy+sin+fonod.png";

type CorrelationInsightTileProps = {
  insights: string[];
  checkInDays: number;
};

export function CorrelationInsightTile({ insights, checkInDays }: CorrelationInsightTileProps) {
  const t = useTranslations("studentWellbeing");
  const displayInsights = insights.slice(0, 2);
  const buildingProfile = checkInDays < 7;
  const progress = Math.min(100, Math.round((checkInDays / 7) * 100));

  return (
    <section className="rounded-2xl border border-[var(--app-primary)]/25 bg-gradient-to-br from-[var(--app-primary)]/10 via-[var(--app-surface-elevated)] to-[var(--app-surface-soft)] p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-primary)]/15 text-[var(--app-primary)]">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <h3 className="text-base font-semibold text-[var(--app-fg)]">{t("correlationLabel")}</h3>
      </div>
      {buildingProfile ? (
        <div className="space-y-3 rounded-xl border border-[var(--app-primary)]/15 bg-[var(--app-surface)]/80 p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <Image
                src={LIZYY_IMAGE_URL}
                alt="Lisyy curiosa"
                width={64}
                height={64}
                unoptimized
                className="h-full w-full object-contain object-bottom"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--app-fg)]">{t("correlation.buildingTitle")}</p>
              <p className="text-sm leading-relaxed text-[var(--app-fg-secondary)]">
                {t("correlation.buildingBody")}
              </p>
            </div>
          </div>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--app-surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--app-primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
              {t("correlation.progress", { done: checkInDays, total: 7 })}
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {displayInsights.map((insight, index) => {
            const Icon = INSIGHT_ICONS[index] ?? MessageSquareHeart;
            return (
              <li
                key={`${insight}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-[var(--app-primary)]/15 bg-[var(--app-surface)]/80 px-3 py-2.5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary)]/15 text-[var(--app-primary)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-[var(--app-fg-secondary)]">{insight}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
