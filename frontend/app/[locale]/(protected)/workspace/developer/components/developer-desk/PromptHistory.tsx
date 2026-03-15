"use client";

import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import { usePrompts } from "@/app/lib/developer-workspace";
import type { PromptApi } from "@/app/lib/developer-workspace/types";
import { cn } from "@/lib/utils";

export interface PromptHistoryProps {
  className?: string;
  onContentLoad?: (content: string) => void;
  maxItems?: number;
}

export function PromptHistory({
  className,
  onContentLoad,
  maxItems = 8,
}: PromptHistoryProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const { token } = useAuth();
  const { data: prompts } = usePrompts(token, {
    recent: true,
    sortBy: "last_used_at",
    sortOrder: "desc",
  });

  const list = (prompts ?? []).slice(0, maxItems);

  const handleCopy = async (p: PromptApi) => {
    try {
      await navigator.clipboard.writeText(p.content);
    } catch {
      // ignore
    }
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/80">
        {t("promptHistory")}
      </h2>
      {list.length === 0 ? (
        <p
          className="mt-3 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
          style={{ opacity: 0.6 }}
        >
          {t("noPromptHistory")}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => onContentLoad?.(p.content)}
                className="min-w-0 flex-1 truncate text-left text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] hover:text-[var(--app-navy)]"
              >
                {p.title || p.content.slice(0, 50) || p.id}
              </button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleCopy(p)}
                  title={t("copy")}
                  className="h-7 w-7 text-[var(--app-fg)]/70 hover:text-[var(--app-navy)]"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
