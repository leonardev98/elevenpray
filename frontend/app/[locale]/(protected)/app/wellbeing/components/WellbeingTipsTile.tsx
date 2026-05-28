"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Clock,
  Droplet,
  Footprints,
  Moon,
  StretchHorizontal,
  Monitor,
  Heart,
  Wind,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WELLBEING_TIP_IDS, type WellbeingTipId } from "../wellbeing-mock-data";
import { WellbeingBlockLabel } from "./WellbeingBlockLabel";
import { BentoTile } from "./BentoTile";

const TIP_ICONS: Record<WellbeingTipId, LucideIcon> = {
  studyBlocks: Clock,
  water: Droplet,
  sleep: Moon,
  walk: Footprints,
  stretch: StretchHorizontal,
  screenBreak: Monitor,
  gratitude: Heart,
  breathing: Wind,
};

const TIPS_PER_VIEW = 4;

function pickRandomTips(count: number): WellbeingTipId[] {
  const pool = [...WELLBEING_TIP_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function WellbeingTipsTile({ index = 6 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const [visibleTips, setVisibleTips] = useState<WellbeingTipId[]>(() =>
    pickRandomTips(TIPS_PER_VIEW),
  );
  const [fading, setFading] = useState(false);

  const tipKeys = useMemo(() => visibleTips, [visibleTips]);

  const handleRefresh = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setVisibleTips((prev) => {
        let next = pickRandomTips(TIPS_PER_VIEW);
        let attempts = 0;
        while (
          next.every((id, i) => id === prev[i]) &&
          attempts < 10
        ) {
          next = pickRandomTips(TIPS_PER_VIEW);
          attempts++;
        }
        return next;
      });
      setFading(false);
    }, 200);
  }, []);

  return (
    <BentoTile span={2} mdSpan={2} index={index}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="[&_h2]:mb-0">
          <WellbeingBlockLabel>{t("tipsLabel")}</WellbeingBlockLabel>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label={t("tipsRefresh")}
          className="shrink-0 rounded-lg p-2 text-[var(--app-fg-muted)] transition-all hover:bg-[var(--app-surface)] hover:text-[var(--app-primary)]"
        >
          <RotateCcw
            className={`h-4 w-4 transition-transform duration-300 ${fading ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <ul
        className={`grid grid-cols-1 gap-2 transition-opacity duration-300 sm:grid-cols-2 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        {tipKeys.map((id) => {
          const Icon = TIP_ICONS[id];
          return (
            <li
              key={id}
              className="flex items-start gap-2.5 rounded-xl bg-[var(--app-surface)]/60 px-3 py-2.5"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-primary)]"
                aria-hidden
              />
              <span className="text-sm leading-snug text-[var(--app-fg-secondary)]">
                {t(`tips.${id}`)}
              </span>
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}
