"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MOCK_SNIPPETS } from "@/app/lib/developer-workspace";
import type { Snippet } from "@/app/lib/developer-workspace/types";
import type { SnippetFilterTab } from "../components/snippets/SnippetFilters";
import {
  SnippetSearch,
  SnippetFilters,
  SnippetCard,
  SnippetModal,
  SnippetSection,
} from "../components/snippets";

const FAVORITES_LIMIT = 6;
const MOST_USED_LIMIT = 6;
const RECENTLY_USED_LIMIT = 6;
const GRID_CLASSES = "grid grid-cols-1 gap-6 lg:grid-cols-2 grid-auto-rows-[260px] items-start";

function matchesTab(snippet: Snippet, tab: SnippetFilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "favorites") return snippet.favorite;
  const tags = snippet.tags.map((t) => t.toLowerCase());
  const lang = snippet.language?.toLowerCase() ?? "";
  switch (tab) {
    case "react":
      return tags.includes("react") || lang.includes("react");
    case "node":
      return tags.includes("node");
    case "utils":
      return tags.includes("util") || tags.includes("async");
    case "cli":
      return tags.includes("cli");
    case "api":
      return tags.includes("api") || tags.includes("nextjs");
    default:
      return true;
  }
}

function matchesSearch(snippet: Snippet, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    snippet.title.toLowerCase().includes(q) ||
    snippet.description.toLowerCase().includes(q) ||
    snippet.tags.some((t) => t.toLowerCase().includes(q)) ||
    snippet.language.toLowerCase().includes(q) ||
    snippet.content.toLowerCase().includes(q)
  );
}

export default function SnippetsPage() {
  const t = useTranslations("developerWorkspace.snippets");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<SnippetFilterTab>("all");
  const [expandedSnippet, setExpandedSnippet] = useState<Snippet | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    new Set(MOCK_SNIPPETS.filter((s) => s.favorite).map((s) => s.id))
  );

  const toggleFavorite = useCallback((snippet: Snippet) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(snippet.id)) next.delete(snippet.id);
      else next.add(snippet.id);
      return next;
    });
  }, []);

  const snippetsWithFavorites = useMemo(
    () =>
      MOCK_SNIPPETS.map((s) => ({
        ...s,
        favorite: favorites.has(s.id),
      })),
    [favorites]
  );

  const filtered = useMemo(
    () =>
      snippetsWithFavorites.filter(
        (s) => matchesTab(s, filterTab) && matchesSearch(s, search)
      ),
    [snippetsWithFavorites, filterTab, search]
  );

  const favoritesFiltered = useMemo(
    () =>
      snippetsWithFavorites
        .filter(
          (s) =>
            s.favorite &&
            matchesTab(s, filterTab) &&
            matchesSearch(s, search)
        )
        .slice(0, FAVORITES_LIMIT),
    [snippetsWithFavorites, filterTab, search]
  );

  const mostUsed = useMemo(
    () =>
      [...snippetsWithFavorites]
        .filter((s) => (s.timesUsed ?? 0) > 0)
        .sort((a, b) => (b.timesUsed ?? 0) - (a.timesUsed ?? 0))
        .slice(0, MOST_USED_LIMIT),
    [snippetsWithFavorites]
  );

  const recentlyUsed = useMemo(
    () =>
      [...snippetsWithFavorites]
        .filter((s) => s.lastUsed != null)
        .sort(
          (a, b) =>
            new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()
        )
        .slice(0, RECENTLY_USED_LIMIT),
    [snippetsWithFavorites]
  );

  const mostUsedFiltered = useMemo(
    () =>
      mostUsed.filter(
        (s) => matchesTab(s, filterTab) && matchesSearch(s, search)
      ),
    [mostUsed, filterTab, search]
  );

  const recentlyUsedFiltered = useMemo(
    () =>
      recentlyUsed.filter(
        (s) => matchesTab(s, filterTab) && matchesSearch(s, search)
      ),
    [recentlyUsed, filterTab, search]
  );

  const gridSnippets = useMemo(() => {
    const favoriteIds = new Set(favoritesFiltered.map((s) => s.id));
    const mostUsedIds = new Set(mostUsedFiltered.map((s) => s.id));
    const recentlyUsedIds = new Set(recentlyUsedFiltered.map((s) => s.id));
    return filtered.filter(
      (s) =>
        !favoriteIds.has(s.id) &&
        !mostUsedIds.has(s.id) &&
        !recentlyUsedIds.has(s.id)
    );
  }, [filtered, favoritesFiltered, mostUsedFiltered, recentlyUsedFiltered]);

  const cardProps = {
    onExpand: setExpandedSnippet,
    onToggleFavorite: toggleFavorite,
    copyToastMessage: t("copyToast"),
    lastUsedLabel: t("lastUsed"),
    timesUsedLabel: t("timesUsed"),
  };

  return (
    <div className="snippets-section mx-auto flex max-w-[1400px] flex-col pb-10">
      <header className="sticky top-0 z-10 flex h-[220px] shrink-0 flex-col justify-between border-b border-[var(--snippets-border)] bg-[var(--snippets-bg)] pb-6 pt-1">
        <div className="shrink-0">
          <h1 className="text-2xl font-semibold leading-tight text-[var(--snippets-fg)]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm leading-tight text-[var(--snippets-fg-muted)]">
            {t("subtitle")}
          </p>
        </div>
        <SnippetSearch
          value={search}
          onChange={setSearch}
          placeholder={t("searchPlaceholder")}
          className="h-11 max-w-xl shrink-0"
        />
        <div className="h-10 shrink-0">
          <SnippetFilters
            active={filterTab}
            onSelect={setFilterTab}
            getLabel={(key) => t(key)}
          />
        </div>
      </header>

      <section
        className="min-h-0 shrink-0 overflow-y-auto pt-6"
        style={{ height: "65vh" }}
        data-lenis-prevent
      >
        <div className="flex flex-col gap-6 pb-8">
          <SnippetSection
            title={t("sectionFavorites")}
            snippets={favoritesFiltered}
            {...cardProps}
          />
          <SnippetSection
            title={t("sectionMostUsed")}
            snippets={mostUsedFiltered}
            {...cardProps}
          />
          <SnippetSection
            title={t("sectionRecentlyUsed")}
            snippets={recentlyUsedFiltered}
            {...cardProps}
          />
          {gridSnippets.length > 0 ? (
            <div className={GRID_CLASSES}>
              {gridSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  {...cardProps}
                />
              ))}
            </div>
          ) : null}
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-[var(--snippets-fg-muted)]">
              {t("noResults")}
            </p>
          ) : null}
        </div>
      </section>

      <SnippetModal
        snippet={expandedSnippet}
        open={expandedSnippet != null}
        onClose={() => setExpandedSnippet(null)}
        copyToastMessage={t("copyToast")}
        copySnippetLabel={t("copySnippet")}
        closeLabel={t("close")}
      />
    </div>
  );
}
