"use client";

import { useState } from "react";
import { Copy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Snippet } from "@/app/lib/developer-workspace/types";

interface SnippetCardProps {
  snippet: Snippet;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[var(--app-fg)]">{snippet.title}</h3>
            <span className="rounded bg-[var(--app-navy)]/10 px-1.5 py-0.5 text-xs font-medium text-[var(--app-navy)]">
              {snippet.language}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--app-fg)]/60">{snippet.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-xs text-[var(--app-fg)]/60"
              >
                {tag}
              </span>
            ))}
          </div>
          {snippet.lastUsed && (
            <p className="mt-2 text-xs text-[var(--app-fg)]/50">
              Last used: {new Date(snippet.lastUsed).toLocaleDateString()}
            </p>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-[var(--app-navy)] hover:underline"
          >
            {expanded ? "Hide code" : "Show code"}
          </button>
          {expanded && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-[var(--app-bg)] p-3 text-xs text-[var(--app-fg)]/80">
              {snippet.content}
            </pre>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
          {copied && <span className="text-xs text-emerald-600">Copied</span>}
          <button
            type="button"
            className={cn(
              "rounded-lg p-2",
              snippet.favorite ? "text-amber-500" : "text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]"
            )}
          >
            <Star className={cn("h-4 w-4", snippet.favorite && "fill-current")} />
          </button>
        </div>
      </div>
    </article>
  );
}
