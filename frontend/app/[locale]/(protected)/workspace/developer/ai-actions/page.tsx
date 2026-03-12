"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  MessageSquare,
  CheckSquare,
  Code2,
  Tag,
  FileText,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_KEYS = [
  "saveAsPrompt",
  "convertNoteToTask",
  "snippetToTemplate",
  "suggestTags",
  "summarizeNote",
  "organizePrompts",
] as const;
const ACTION_ICONS = [MessageSquare, CheckSquare, Code2, Tag, FileText, LayoutGrid];
const ACTIONS = ACTION_KEYS.map((key, i) => ({ key, icon: ACTION_ICONS[i]! }));

export default function AIActionsPage() {
  const t = useTranslations("developerWorkspace.aiActions");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [mockResult, setMockResult] = useState(false);

  const runAction = (key: string) => {
    setSelectedAction(key);
    setMockResult(false);
    setTimeout(() => setMockResult(true), 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Strategic AI actions: save as prompt, convert to task, suggest tags, and more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map(({ key, icon: Icon }, i) => (
          <motion.button
            key={key}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => runAction(key)}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-left shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md",
              selectedAction === key && "ring-2 ring-[var(--app-navy)]/20"
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-navy)]/10">
              <Icon className="h-6 w-6 text-[var(--app-navy)]" />
            </div>
            <span className="font-medium text-[var(--app-fg)]">{t(key)}</span>
          </motion.button>
        ))}
      </div>

      {selectedAction && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6"
        >
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">
            {t(selectedAction)}
          </h2>
          <p className="mt-2 text-sm text-[var(--app-fg)]/60">
            Select text or an item elsewhere, then use “Send to AI” to run this action.
          </p>
          {mockResult ? (
            <div className="mt-4 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
              Result ready (mocked). Integration with real AI can be added later.
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--app-fg)]/60">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Processing…
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
}
