"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SnippetSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SnippetSearch({
  value,
  onChange,
  placeholder = "Search snippets, hooks, helpers…",
  className,
}: SnippetSearchProps) {
  return (
    <div className={cn("relative h-11 shrink-0", className)}>
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 shrink-0 text-[var(--snippets-fg-muted)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-xl border border-[var(--snippets-border)] bg-[var(--snippets-card)] pl-12 pr-4 text-sm text-[var(--snippets-fg)] placeholder:text-[var(--snippets-fg-muted)] focus:border-[var(--snippets-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--snippets-accent)]/20 transition-colors"
        aria-label={placeholder}
      />
    </div>
  );
}
