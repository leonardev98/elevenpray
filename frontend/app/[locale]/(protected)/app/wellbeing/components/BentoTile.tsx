"use client";

import type { CSSProperties, ReactNode } from "react";

type Span = 1 | 2 | 3 | 4;

const MD_SPAN_CLASSES: Record<Span, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-2",
  4: "md:col-span-2",
};

const LG_SPAN_CLASSES: Record<Span, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
};

export type BentoTileProps = {
  children: ReactNode;
  span?: Span;
  mdSpan?: 1 | 2;
  index?: number;
  interactive?: boolean;
  accent?: boolean;
  className?: string;
  id?: string;
};

export function BentoTile({
  children,
  span = 1,
  mdSpan,
  index = 0,
  interactive = false,
  accent = false,
  className = "",
  id,
}: BentoTileProps) {
  const effectiveMdSpan = mdSpan ?? (span >= 2 ? 2 : 1);

  return (
    <div
      id={id}
      className={[
        "bento-tile-enter col-span-1 overflow-hidden rounded-2xl border border-[var(--app-border)] p-5 shadow-[var(--app-shadow-card)]",
        accent
          ? "bg-gradient-to-br from-[var(--app-primary)]/12 via-[var(--app-surface-elevated)] to-[var(--app-surface-soft)]"
          : "bg-[var(--app-surface-elevated)]",
        interactive
          ? "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
          : "",
        MD_SPAN_CLASSES[effectiveMdSpan as Span],
        LG_SPAN_CLASSES[span],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--bento-delay": `${index * 50}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
