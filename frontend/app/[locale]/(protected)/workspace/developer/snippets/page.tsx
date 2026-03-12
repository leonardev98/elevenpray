"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { SnippetCard } from "../components/SnippetCard";
import { MOCK_SNIPPETS } from "@/app/lib/developer-workspace";

export default function SnippetsPage() {
  const t = useTranslations("developerWorkspace.sidebar");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_SNIPPETS;
    const q = search.toLowerCase();
    return MOCK_SNIPPETS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("snippets")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Reusable code: hooks, helpers, patterns.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-fg)]/50" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search snippets…"
          className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--app-fg)]/50">No snippets match.</p>
      )}
    </div>
  );
}
