"use client";

import { SnippetCard } from "./SnippetCard";
import type { Snippet } from "@/app/lib/developer-workspace/types";

const GRID_CLASSES =
  "grid grid-cols-1 gap-6 lg:grid-cols-2 grid-auto-rows-[260px] items-start";

export interface SnippetSectionProps {
  title: string;
  snippets: Snippet[];
  onExpand: (snippet: Snippet) => void;
  onToggleFavorite?: (snippet: Snippet) => void;
  copyToastMessage?: string;
  lastUsedLabel?: string;
  timesUsedLabel?: string;
}

export function SnippetSection({
  title,
  snippets,
  onExpand,
  onToggleFavorite,
  copyToastMessage,
  lastUsedLabel,
  timesUsedLabel,
}: SnippetSectionProps) {
  const cardProps = {
    onExpand,
    onToggleFavorite,
    copyToastMessage,
    lastUsedLabel,
    timesUsedLabel,
  };

  return (
    <div className="min-h-[100px] shrink-0">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-[var(--snippets-fg-muted)]">
        {title}
      </h2>
      {snippets.length > 0 ? (
        <div className={GRID_CLASSES}>
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} {...cardProps} />
          ))}
        </div>
      ) : (
        <div className="h-4 shrink-0" aria-hidden />
      )}
    </div>
  );
}
