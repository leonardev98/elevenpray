"use client";

import { useTranslations } from "next-intl";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import { usePrompts } from "@/app/lib/developer-workspace";
import type { PromptApi } from "@/app/lib/developer-workspace/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PromptHistoryCardProps {
  className?: string;
  onContentLoad?: (content: string) => void;
  maxItems?: number;
}

export function PromptHistoryCard({
  className,
  onContentLoad,
  maxItems = 8,
}: PromptHistoryCardProps) {
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
      toast(t("copied"));
    } catch {
      toast(t("copyError"));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className={cn("dev-dash-card p-4", className)}
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--dev-dash-fg-muted)] mb-3">
        {t("promptHistory")}
      </h2>
      {list.length === 0 ? (
        <p className="text-sm text-[var(--dev-dash-fg-muted)]">{t("noPromptHistory")}</p>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--dev-dash-border)] bg-[var(--dev-dash-row-bg)] px-3 py-2 group hover:border-[var(--dev-dash-accent-indigo)]/30"
            >
              <button
                type="button"
                onClick={() => onContentLoad?.(p.content)}
                className="min-w-0 flex-1 truncate text-left text-sm text-[var(--dev-dash-fg)] hover:text-[var(--dev-dash-accent-blue)] font-mono"
              >
                {p.title || p.content.slice(0, 50) || p.id}
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
                  onClick={() => handleCopy(p)}
                  title={t("copy")}
                  aria-label={t("copy")}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
                  onClick={() => onContentLoad?.(p.content)}
                  title={t("reuse")}
                  aria-label={t("reuse")}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
