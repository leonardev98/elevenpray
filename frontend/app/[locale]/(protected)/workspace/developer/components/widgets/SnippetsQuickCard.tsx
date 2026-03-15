"use client";

import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MOCK_SNIPPETS } from "@/app/lib/developer-workspace";
import { cn } from "@/lib/utils";

const QUICK_SNIPPET_TITLES = [
  "fetch with timeout",
  "retry with backoff",
  "useDebounce hook",
  "node CLI template",
];

export function SnippetsQuickCard({ className }: { className?: string }) {
  const t = useTranslations("developerWorkspace.dashboard");
  const snippets = MOCK_SNIPPETS.filter((s) =>
    QUICK_SNIPPET_TITLES.some((title) => s.title.toLowerCase().includes(title.toLowerCase()))
  );
  const displayList = snippets.length > 0 ? snippets : MOCK_SNIPPETS.slice(0, 4);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast(t("copied"));
    } catch {
      toast(t("copyError"));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className={cn("dev-dash-card p-4", className)}
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--dev-dash-fg-muted)] mb-3">
        {t("snippetsQuick")}
      </h2>
      <ul className="space-y-2">
        {displayList.map((snippet) => (
          <li
            key={snippet.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-[var(--dev-dash-border)] bg-[var(--dev-dash-row-bg)] px-3 py-2 group hover:border-[var(--dev-dash-accent-indigo)]/30"
          >
            <span className="min-w-0 truncate text-sm text-[var(--dev-dash-fg)] font-mono">
              {snippet.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
              onClick={() => handleCopy(snippet.content)}
              aria-label={t("copy")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
