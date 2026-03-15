"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  Star,
  Pin,
  MoreHorizontal,
  Pencil,
  CopyPlus,
  Archive,
  Trash2,
  Expand,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonMotion } from "@/lib/animations";
import type { PromptApi } from "@/app/lib/developer-workspace";

interface PromptRowProps {
  prompt: PromptApi;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onOpenFullView?: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  copied?: boolean;
}

function formatDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function contentPreview(content: string, maxLines = 3, maxChars = 140): string {
  if (!content?.trim()) return "";
  const lines = content.trim().split(/\r?\n/).slice(0, maxLines);
  const joined = lines.map((l) => l.trim()).join(" ").replace(/\s+/g, " ");
  return joined.length > maxChars ? joined.slice(0, maxChars) + "…" : joined;
}

function hoverPreviewContent(content: string, maxChars = 320): string {
  if (!content?.trim()) return "";
  const trimmed = content.trim().replace(/\s+/g, " ");
  return trimmed.length > maxChars ? trimmed.slice(0, maxChars) + "…" : trimmed;
}

export function PromptRow({
  prompt,
  isSelected,
  onSelect,
  onCopy,
  onOpenFullView,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  copied,
}: PromptRowProps) {
  const t = useTranslations("developerWorkspace.prompts");

  const hoverPreview = prompt.content?.trim() ? hoverPreviewContent(prompt.content) : null;

  const contentBlock = (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate font-medium text-[var(--app-fg)]">{prompt.title}</span>
        {prompt.isPinned && (
          <Pin className="h-3.5 w-3.5 shrink-0 fill-current text-[var(--app-fg)]/60" />
        )}
      </div>
      {prompt.description && (
        <p className="mt-0.5 line-clamp-1 text-sm text-[var(--app-fg)]/60">
          {prompt.description}
        </p>
      )}
      {prompt.content?.trim() && (
        <p className="mt-0.5 line-clamp-2 text-sm text-[var(--app-fg)]/60">
          {contentPreview(prompt.content, 3, 140)}
        </p>
      )}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--app-fg)]/50">
        {prompt.category && (
          <span className="rounded bg-[var(--app-bg)] px-1.5 py-0.5">
            {prompt.category.name || prompt.category.code}
          </span>
        )}
        {prompt.folder && <span>{prompt.folder.name}</span>}
        {prompt.project && <span>{prompt.project.name}</span>}
        {prompt.tags && prompt.tags.length > 0 && (
          <span className="flex gap-1">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-[var(--app-fg)]/60"
              >
                {tag.name}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[var(--app-fg)]/40">+{prompt.tags.length - 3}</span>
            )}
          </span>
        )}
        <span title={prompt.updatedAt}>
          {prompt.lastUsedAt ? formatDate(prompt.lastUsedAt) : formatDate(prompt.updatedAt)}
        </span>
      </div>
    </div>
  );

  const actionsBlock = (
    <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
        <span className="flex items-center gap-0.5">
          <motion.div whileTap={buttonMotion.tap} transition={buttonMotion.transition}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-[var(--app-fg)]/70 dark:hover:bg-[var(--app-bg)] dark:hover:text-[var(--app-fg)]"
              onClick={onCopy}
              title={t("copy")}
              aria-label={t("copy")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </motion.div>
          {copied && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">{t("copied")}</span>
          )}
        </span>
        <motion.div whileTap={buttonMotion.tap} transition={buttonMotion.transition}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-[var(--app-fg)]/70 dark:hover:bg-[var(--app-bg)] dark:hover:text-[var(--app-fg)]",
              prompt.isFavorite &&
                "text-amber-600 dark:text-amber-400 hover:!text-amber-700 dark:hover:!text-amber-300 [&_svg]:fill-current"
            )}
            onClick={onToggleFavorite}
            title={t("favorites")}
            aria-label={t("favorites")}
          >
            <Star className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div whileTap={buttonMotion.tap} transition={buttonMotion.transition}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-[var(--app-fg)]/70 dark:hover:bg-[var(--app-bg)] dark:hover:text-[var(--app-fg)]",
              prompt.isPinned && "!text-[var(--app-navy)] [&_svg]:fill-current"
            )}
            onClick={onTogglePin}
            title={t("pin")}
            aria-label={t("pin")}
          >
            <Pin className="h-4 w-4" />
          </Button>
        </motion.div>
        <DropdownMenu>
          <motion.div whileTap={buttonMotion.tap} transition={buttonMotion.transition}>
            <DropdownMenuTrigger
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-[var(--app-fg)]/70 dark:hover:bg-[var(--app-bg)] dark:hover:text-[var(--app-fg)]"
              aria-label={t("more")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
          </motion.div>
          <DropdownMenuContent align="end" className="min-w-[11rem]">
            {onOpenFullView && (
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onOpenFullView(); }}>
                <Expand className="h-4 w-4" />
                {t("viewFull")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onEdit()}>
              <Pencil className="h-4 w-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate()}>
              <CopyPlus className="h-4 w-4" />
              {t("duplicate")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onArchive()}>
              <Archive className="h-4 w-4" />
              {prompt.status === "archived" ? t("unarchive") : t("archive")}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete()}>
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );

  const row = (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        isSelected
          ? "border-[var(--app-navy)]/30 bg-[var(--app-navy)]/5"
          : "border-[var(--dev-border-subtle)] bg-[var(--app-surface)]/80 hover:bg-[var(--app-surface)]"
      )}
    >
      {hoverPreview ? (
        <Tooltip delay={400}>
          <Tooltip.Root>
            <Tooltip.Trigger className="min-w-0 flex-1 cursor-pointer text-left outline-none">
              {contentBlock}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup className="max-w-sm whitespace-pre-wrap break-words">
                  {hoverPreview}
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip>
      ) : (
        contentBlock
      )}
      {actionsBlock}
    </div>
  );

  return row;
}
