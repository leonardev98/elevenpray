"use client";

import { cn } from "@/lib/utils";

export type SnippetFilterTab =
  | "all"
  | "react"
  | "node"
  | "utils"
  | "cli"
  | "api"
  | "favorites";

const TABS: { id: SnippetFilterTab; labelKey: string }[] = [
  { id: "all", labelKey: "filters.all" },
  { id: "react", labelKey: "filters.react" },
  { id: "node", labelKey: "filters.node" },
  { id: "utils", labelKey: "filters.utils" },
  { id: "cli", labelKey: "filters.cli" },
  { id: "api", labelKey: "filters.api" },
  { id: "favorites", labelKey: "filters.favorites" },
];

export interface SnippetFiltersProps {
  active: SnippetFilterTab;
  onSelect: (tab: SnippetFilterTab) => void;
  getLabel: (key: string) => string;
  className?: string;
}

export function SnippetFilters({
  active,
  onSelect,
  getLabel,
  className,
}: SnippetFiltersProps) {
  return (
    <nav
      className={cn("flex flex-nowrap gap-2 overflow-x-auto pb-1", className)}
      role="tablist"
      aria-label="Filter snippets"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--snippets-filter-active-bg)] text-[var(--snippets-filter-active-fg)]"
                : "text-[var(--snippets-filter-inactive-fg)] hover:bg-[var(--snippets-filter-hover-bg)] hover:text-[var(--snippets-fg)]"
            )}
          >
            {getLabel(tab.labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
