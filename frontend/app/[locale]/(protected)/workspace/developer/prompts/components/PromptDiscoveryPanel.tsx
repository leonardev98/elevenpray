"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Copy, Plus, FileInput, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPrompt } from "@/app/lib/developer-workspace/api/prompts-api";
import {
  useDiscoveryPrompts,
  type DiscoveryPromptItem,
} from "@/app/lib/developer-workspace";

const tipKeys = ["tip1", "tip2", "tip3", "tip4", "tip5"] as const;

function discoveryPreview(content: string, maxChars = 80): string {
  if (!content?.trim()) return "";
  const trimmed = content.trim().replace(/\s+/g, " ");
  return trimmed.length > maxChars ? trimmed.slice(0, maxChars) + "…" : trimmed;
}

interface DiscoveryItemCardProps {
  item: DiscoveryPromptItem;
  onCopy: (item: DiscoveryPromptItem) => void;
  onAddToVault: (item: DiscoveryPromptItem) => void;
  copiedId: string | null;
}

function DiscoveryItemCard({
  item,
  onCopy,
  onAddToVault,
  copiedId,
}: DiscoveryItemCardProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const isCopied = copiedId === item.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-surface)] p-3 transition-colors hover:border-[var(--app-navy)]/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--app-fg)]">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--app-fg)]/60">
            {discoveryPreview(item.content)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onCopy(item)}
            className="h-7 px-2 text-[var(--app-fg)]/70"
            aria-label={t("copy")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onAddToVault(item)}
            className="h-7 px-2 text-[var(--app-fg)]/70"
            aria-label={t("addToVault")}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {isCopied && (
        <span className="mt-1 block text-xs text-emerald-600">{t("copied")}</span>
      )}
    </motion.div>
  );
}

export interface PromptDiscoveryPanelProps {
  token: string | null;
  onRefetch: () => void;
  onNewPrompt: () => void;
  onImportPrompt: () => void;
  onCreateTemplate: () => void;
}

export function PromptDiscoveryPanel({
  token,
  onRefetch,
  onNewPrompt,
  onImportPrompt,
  onCreateTemplate,
}: PromptDiscoveryPanelProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const locale = useLocale() as string;
  const effectiveLocale = locale === "es" || locale === "en" ? locale : "en";
  const { data: promptsOfTheDay, isLoading: loadingDay } = useDiscoveryPrompts(
    token,
    effectiveLocale,
    "prompts_of_the_day"
  );
  const { data: trendingPrompts, isLoading: loadingTrending } = useDiscoveryPrompts(
    token,
    effectiveLocale,
    "trending"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback((item: DiscoveryPromptItem) => {
    navigator.clipboard.writeText(item.content).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleAddToVault = useCallback(
    async (item: DiscoveryPromptItem) => {
      if (!token) return;
      try {
        await createPrompt(token, {
          title: item.title,
          content: item.content,
          status: "active",
        });
        onRefetch();
      } catch {
        // ignore
      }
    },
    [token, onRefetch]
  );

  return (
    <aside
      className="flex min-h-0 w-[320px] shrink-0 flex-col py-2 pl-2 pr-2"
      aria-label="Prompt Discovery"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-surface)]/60 shadow-sm">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {/* Quick actions */}
          <section className="mb-6 shrink-0" aria-labelledby="discovery-quick-actions-heading">
        <h2 id="discovery-quick-actions-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg)]/50">
          {t("quickActions")}
        </h2>
        <div className="flex flex-col gap-2">
          <Button
            variant="default"
            size="default"
            className="w-full justify-center bg-[var(--app-navy)] text-white hover:opacity-90"
            onClick={onNewPrompt}
          >
            {t("newPrompt")}
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full justify-center gap-2 border-[var(--app-border)] text-[var(--app-fg)]"
            onClick={onImportPrompt}
          >
            <FileInput className="h-4 w-4" />
            {t("importPrompt")}
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full justify-center gap-2 border-[var(--app-border)] text-[var(--app-fg)]"
            onClick={onCreateTemplate}
          >
            <LayoutTemplate className="h-4 w-4" />
            {t("createTemplate")}
          </Button>
        </div>
      </section>

          {/* Prompts of the day */}
          <section className="mb-6 shrink-0" aria-labelledby="discovery-day-heading">
        <h2 id="discovery-day-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg)]/50">
          {t("promptsOfTheDay")}
        </h2>
        <div className="flex flex-col gap-2">
          {loadingDay ? (
            <p className="py-2 text-xs text-[var(--app-fg)]/50">…</p>
          ) : (
            promptsOfTheDay.map((item) => (
              <DiscoveryItemCard
                key={item.id}
                item={item}
                onCopy={handleCopy}
                onAddToVault={handleAddToVault}
                copiedId={copiedId}
              />
            ))
          )}
        </div>
      </section>

          {/* Trending prompts */}
          <section className="mb-6 shrink-0" aria-labelledby="discovery-trending-heading">
        <h2 id="discovery-trending-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg)]/50">
          {t("trendingPrompts")}
        </h2>
        <div className="flex flex-col gap-2">
          {loadingTrending ? (
            <p className="py-2 text-xs text-[var(--app-fg)]/50">…</p>
          ) : (
            trendingPrompts.map((item) => (
              <DiscoveryItemCard
                key={item.id}
                item={item}
                onCopy={handleCopy}
                onAddToVault={handleAddToVault}
                copiedId={copiedId}
              />
            ))
          )}
        </div>
      </section>

          {/* Prompt tips */}
          <section className="shrink-0" aria-labelledby="discovery-tips-heading">
        <h2 id="discovery-tips-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg)]/50">
          {t("promptTips")}
        </h2>
        <ul className="flex flex-col gap-2">
          {tipKeys.map((key, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-surface)]/80 px-3 py-2 text-xs text-[var(--app-fg)]/80"
            >
              {t(key)}
            </motion.li>
          ))}
        </ul>
          </section>
        </div>
      </div>
    </aside>
  );
}
