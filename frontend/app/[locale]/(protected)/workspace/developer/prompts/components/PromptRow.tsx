"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  Star,
  Pin,
  MoreHorizontal,
  Pencil,
  CopyPlus,
  FolderInput,
  Archive,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptApi } from "@/app/lib/developer-workspace";

interface PromptRowProps {
  prompt: PromptApi;
  isSelected: boolean;
  onSelect: () => void;
  onCopy: () => void;
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

export function PromptRow({
  prompt,
  isSelected,
  onSelect,
  onCopy,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  copied,
}: PromptRowProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--app-fg)]/60" title={prompt.content.trim().slice(0, 200)}>
            {contentPreview(prompt.content, 3, 140)}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--app-fg)]/50">
          {prompt.category && (
            <span className="rounded bg-[var(--app-bg)] px-1.5 py-0.5">
              {prompt.category.name || prompt.category.code}
            </span>
          )}
          {prompt.folder && (
            <span>{prompt.folder.name}</span>
          )}
          {prompt.project && (
            <span>{prompt.project.name}</span>
          )}
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
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="rounded p-1.5 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          title={t("copy")}
        >
          <Copy className="h-4 w-4" />
        </button>
        {copied && (
          <span className="text-xs text-emerald-600">{t("copied")}</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            "rounded p-1.5",
            prompt.isFavorite
              ? "text-amber-500"
              : "text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          )}
          title={t("favorites")}
        >
          <Star className={cn("h-4 w-4", prompt.isFavorite && "fill-current")} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={cn(
            "rounded p-1.5",
            prompt.isPinned
              ? "text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          )}
          title={t("pin")}
        >
          <Pin className={cn("h-4 w-4", prompt.isPinned && "fill-current")} />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="rounded p-1.5 text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] py-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-navy)]/10"
              >
                <Pencil className="h-4 w-4" />
                {t("edit")}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDuplicate();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-navy)]/10"
              >
                <CopyPlus className="h-4 w-4" />
                {t("duplicate")}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onArchive();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-navy)]/10"
              >
                <Archive className="h-4 w-4" />
                {prompt.status === "archived" ? t("unarchive") : t("archive")}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                {t("delete")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
