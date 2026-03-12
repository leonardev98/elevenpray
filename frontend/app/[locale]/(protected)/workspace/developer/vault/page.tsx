"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { VaultCard } from "../components/VaultCard";
import { MOCK_VAULT_ITEMS } from "@/app/lib/developer-workspace";
import type { VaultCategory } from "@/app/lib/developer-workspace/types";
import { cn } from "@/lib/utils";

const CATEGORIES: VaultCategory[] = [
  "environment",
  "ssh",
  "apis",
  "databases",
  "cloud",
  "tokens",
  "localSetup",
];

export default function VaultPage() {
  const t = useTranslations("developerWorkspace.vault");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VaultCategory | "all">("all");

  const filtered = useMemo(() => {
    return MOCK_VAULT_ITEMS.filter((item) => {
      const matchSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = category === "all" || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Secrets, env vars, SSH, API keys — organized and secure.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-fg)]/50" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vault…"
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
          />
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <VaultCard key={item.id} item={item} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--app-fg)]/50">No items match.</p>
      )}
    </div>
  );
}
