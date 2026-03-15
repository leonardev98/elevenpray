"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Pencil, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import {
  usePrompts,
  usePromptFolders,
  usePromptCategories,
  useDeveloperProjects,
  setPromptPinned,
} from "@/app/lib/developer-workspace";
import type { PromptApi } from "@/app/lib/developer-workspace/types";
import { PromptFormDrawer } from "../../prompts/components/PromptFormDrawer";
import { cn } from "@/lib/utils";

export interface PinnedPromptsProps {
  className?: string;
  onContentLoad?: (content: string) => void;
  onSaveSuccess?: () => void;
}

export function PinnedPrompts({
  className,
  onContentLoad,
  onSaveSuccess,
}: PinnedPromptsProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const { token } = useAuth();
  const { data: prompts, refetch } = usePrompts(token, {
    isPinned: true,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
  const { data: folders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects } = useDeveloperProjects(token);

  const [editingPrompt, setEditingPrompt] = useState<PromptApi | null>(null);

  const handleCopy = async (p: PromptApi) => {
    try {
      await navigator.clipboard.writeText(p.content);
    } catch {
      // ignore
    }
  };

  const handleUnpin = async (p: PromptApi) => {
    if (!token) return;
    try {
      await setPromptPinned(token, p.id, false);
      refetch();
    } catch {
      // ignore
    }
  };

  const list = prompts ?? [];

  return (
    <>
      <section
        className={cn(
          "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]",
          className
        )}
      >
        <h2 className="text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/80">
          {t("pinnedPrompts")}
        </h2>
        {list.length === 0 ? (
          <p
            className="mt-3 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
            style={{ opacity: 0.6 }}
          >
            {t("noPinnedPrompts")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[length:var(--dev-font-body-size)] text-[var(--app-fg)]">
                  {p.title || p.content.slice(0, 40) || p.id}
                </span>
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
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditingPrompt(p)}
                    title={t("edit")}
                    className="h-7 w-7 text-[var(--app-fg)]/70 hover:text-[var(--app-navy)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleUnpin(p)}
                    title={t("unpin")}
                    className="h-7 w-7 text-[var(--app-fg)]/70 hover:text-[var(--app-navy)]"
                  >
                    <PinOff className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {token && editingPrompt && (
        <PromptFormDrawer
          open={!!editingPrompt}
          onClose={() => setEditingPrompt(null)}
          prompt={editingPrompt}
          folders={folders ?? []}
          categories={categories ?? []}
          projects={projects ?? []}
          tagSuggestions={editingPrompt.tags?.map((x) => x.name) ?? []}
          token={token}
          onSuccess={() => {
            setEditingPrompt(null);
            refetch();
            onSaveSuccess?.();
          }}
        />
      )}
    </>
  );
}
