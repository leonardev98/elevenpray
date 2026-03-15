"use client";

import { useState } from "react";
import { Copy, Star, Expand, Check } from "lucide-react";
import { toast } from "sonner";
import { SnippetPreview } from "./SnippetPreview";
import { cn } from "@/lib/utils";
import type { Snippet } from "@/app/lib/developer-workspace/types";

export interface SnippetCardProps {
  snippet: Snippet;
  onExpand: (snippet: Snippet) => void;
  onToggleFavorite?: (snippet: Snippet) => void;
  copyToastMessage?: string;
  lastUsedLabel?: string;
  timesUsedLabel?: string;
  className?: string;
}

export function SnippetCard({
  snippet,
  onExpand,
  onToggleFavorite,
  copyToastMessage = "Copied to clipboard ✔",
  lastUsedLabel = "Last used",
  timesUsedLabel = "Times used",
  className,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      toast.success(copyToastMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <article
      className={cn(
        "snippet-card flex h-[260px] w-full max-w-[520px] shrink-0 flex-col overflow-hidden rounded-[12px] border border-[var(--snippets-border)] bg-[var(--snippets-card)] p-[18px] shadow-sm transition-[border-color,box-shadow] duration-150 hover:border-[var(--snippets-card-hover-border)] hover:shadow-md hover:scale-[1.01]",
        className
      )}
    >
      <h3 className="truncate text-base font-semibold leading-snug text-[var(--snippets-fg)]">
        {snippet.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--snippets-fg-muted)]">
        {snippet.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="snippet-tag font-medium" title="Language">
          {snippet.language}
        </span>
        {snippet.tags.map((tag) => (
          <span key={tag} className="snippet-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden">
        <SnippetPreview
          content={snippet.content}
          language={snippet.language}
        />
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg p-2 text-[var(--snippets-fg-muted)] transition-colors hover:bg-[var(--snippets-tag-bg)] hover:text-[var(--snippets-fg)]"
          title="Copy"
          aria-label="Copy"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--snippets-success)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggleFavorite?.(snippet)}
          className={cn(
            "rounded-lg p-2 transition-colors",
            snippet.favorite
              ? "text-amber-500 hover:opacity-80"
              : "text-[var(--snippets-fg-muted)] hover:bg-[var(--snippets-tag-bg)] hover:text-[var(--snippets-fg)]"
          )}
          title={snippet.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={snippet.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("h-4 w-4", snippet.favorite && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={() => onExpand(snippet)}
          className="rounded-lg p-2 text-[var(--snippets-fg-muted)] transition-colors hover:bg-[var(--snippets-tag-bg)] hover:text-[var(--snippets-fg)]"
          title="View code"
          aria-label="View full code"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
