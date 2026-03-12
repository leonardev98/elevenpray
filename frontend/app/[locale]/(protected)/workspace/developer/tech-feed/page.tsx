"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Rss, ExternalLink } from "lucide-react";
import { MOCK_TECH_FEED } from "@/app/lib/developer-workspace";
import type { TechFeedCategory } from "@/app/lib/developer-workspace/types";
import { cn } from "@/lib/utils";

const CATEGORIES: TechFeedCategory[] = [
  "frontend",
  "backend",
  "ai",
  "devops",
  "cloud",
  "openSource",
  "design",
];

export default function TechFeedPage() {
  const t = useTranslations("developerWorkspace.techFeed");
  const [category, setCategory] = useState<TechFeedCategory | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") return MOCK_TECH_FEED;
    return MOCK_TECH_FEED.filter((item) => item.tag === category);
  }, [category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Curated tech news and signals.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            category === "all"
              ? "bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            )}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition-shadow hover:shadow-md"
          >
            <Rss className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-fg)]/50" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--app-fg)]">{item.title}</p>
              <p className="mt-0.5 text-sm text-[var(--app-fg)]/60">
                {item.source} · {item.time}
              </p>
              <span className="mt-2 inline-block rounded-md bg-[var(--app-navy)]/10 px-2 py-0.5 text-xs text-[var(--app-navy)]">
                {t(`categories.${item.tag}`)}
              </span>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-[var(--app-fg)]/40" />
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--app-fg)]/50">No items in this category.</p>
      )}
    </div>
  );
}
