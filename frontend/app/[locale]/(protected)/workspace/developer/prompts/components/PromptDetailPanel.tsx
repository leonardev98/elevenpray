"use client";

import { useTranslations } from "next-intl";
import { Copy, Pencil, CopyPlus, Star, Pin, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptApi } from "@/app/lib/developer-workspace";

interface PromptDetailPanelProps {
  prompt: PromptApi | null;
  onEdit: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onOpenFullView?: () => void;
  copied?: boolean;
}

export function PromptDetailPanel({
  prompt,
  onEdit,
  onCopy,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
  onOpenFullView,
  copied,
}: PromptDetailPanelProps) {
  const t = useTranslations("developerWorkspace.prompts");

  if (!prompt) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/30 p-8 text-center">
        <p className="text-sm text-[var(--app-fg)]/50">
          {t("selectPromptToPreview")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-surface)]">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--dev-border-subtle)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-[var(--app-fg)]">{prompt.title}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--app-fg)]/50">
            {prompt.category && (
              <span className="rounded bg-[var(--app-bg)] px-1.5 py-0.5">
                {prompt.category.name || prompt.category.code}
              </span>
            )}
            {prompt.folder && <span>{prompt.folder.name}</span>}
            {prompt.project && <span>{prompt.project.name}</span>}
            {prompt.tags?.map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-[var(--app-bg)] px-1.5 py-0.5"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="ml-2 flex items-center gap-1">
          {onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-navy)]"
              title={t("viewFull")}
            >
              <Expand className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("copy")}
          >
            <Copy className="h-4 w-4" />
          </button>
          {copied && <span className="text-xs text-emerald-600">{t("copied")}</span>}
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("duplicate")}
          >
            <CopyPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded p-2 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            title={t("edit")}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={cn(
              "rounded p-2",
              prompt.isFavorite ? "text-amber-500" : "text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]"
            )}
            title={t("favorites")}
          >
            <Star className={cn("h-4 w-4", prompt.isFavorite && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={onTogglePin}
            className={cn(
              "rounded p-2",
              prompt.isPinned ? "text-[var(--app-navy)]" : "text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]"
            )}
            title={t("pin")}
          >
            <Pin className={cn("h-4 w-4", prompt.isPinned && "fill-current")} />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        {prompt.description && (
          <p className="mb-3 line-clamp-2 shrink-0 text-sm text-[var(--app-fg)]/70">
            {prompt.description}
          </p>
        )}
        <pre className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-hidden whitespace-pre-wrap break-words rounded-lg bg-[var(--app-bg)] p-3 text-sm font-sans text-[var(--app-fg)]/90">
          {prompt.content}
        </pre>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--dev-surface-elevated)] to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}
