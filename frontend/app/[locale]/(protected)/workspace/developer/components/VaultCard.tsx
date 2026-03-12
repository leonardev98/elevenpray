"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Eye, EyeOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultItem } from "@/app/lib/developer-workspace/types";

interface VaultCardProps {
  item: VaultItem;
}

export function VaultCard({ item }: VaultCardProps) {
  const t = useTranslations("developerWorkspace.vault");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = revealed ? item.value : item.maskedValue;
  const categoryLabel = t(`categories.${item.category}`);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--app-fg)]">{item.title}</h3>
            <span className="rounded-md bg-[var(--app-navy)]/10 px-1.5 py-0.5 text-xs text-[var(--app-navy)]">
              {categoryLabel}
            </span>
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-[var(--app-fg)]/60">{item.description}</p>
          )}
          <p className="mt-2 font-mono text-sm text-[var(--app-fg)]/80">
            {displayValue}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-xs text-[var(--app-fg)]/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="rounded-lg p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("reveal")}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("copy")}
          >
            <Copy className="h-4 w-4" />
            {copied && (
              <span className="absolute mt-1 text-xs text-emerald-600">Copied</span>
            )}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg p-2 hover:bg-[var(--app-bg)]",
              item.favorite ? "text-amber-500" : "text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]"
            )}
            title={t("favorite")}
          >
            <Star className={cn("h-4 w-4", item.favorite && "fill-current")} />
          </button>
        </div>
      </div>
    </article>
  );
}
