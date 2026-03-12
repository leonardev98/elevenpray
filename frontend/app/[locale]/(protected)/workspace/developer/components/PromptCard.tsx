"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/app/lib/developer-workspace/types";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--app-fg)]">{prompt.title}</h3>
          <p className="mt-1 text-sm text-[var(--app-fg)]/60">{prompt.description}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--app-fg)]/50">
            {prompt.category}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-xs text-[var(--app-fg)]/60"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-[var(--app-navy)] hover:underline"
          >
            {expanded ? "Hide content" : "Show content"}
          </button>
          {expanded && (
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-[var(--app-bg)] p-3 text-xs text-[var(--app-fg)]/80">
              {prompt.content}
            </pre>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("copy")}
          >
            <Copy className="h-4 w-4" />
          </button>
          {copied && <span className="text-xs text-emerald-600">Copied</span>}
          <button
            type="button"
            className={cn(
              "rounded-lg p-2",
              prompt.favorite ? "text-amber-500" : "text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]"
            )}
            title={t("pin")}
          >
            <Star className={cn("h-4 w-4", prompt.favorite && "fill-current")} />
          </button>
        </div>
      </div>
    </article>
  );
}
