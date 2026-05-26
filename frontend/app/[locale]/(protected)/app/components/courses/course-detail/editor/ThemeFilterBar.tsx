"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, Filter, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_THEMES, type BlockTheme } from "./types";

interface ThemeFilterBarProps {
  editor: Editor | null;
  /** Filtro activo: null = ver todo. */
  activeFilter: BlockTheme | null;
  onChangeFilter: (theme: BlockTheme | null) => void;
}

export function ThemeFilterBar({ editor, activeFilter, onChangeFilter }: ThemeFilterBarProps) {
  const [tagOpen, setTagOpen] = useState(false);

  function applyTheme(theme: BlockTheme | null) {
    if (!editor) return;
    editor.chain().focus().setBlockTheme(theme).run();
    setTagOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => setTagOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
          aria-expanded={tagOpen}
          aria-haspopup="menu"
        >
          <Tag className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
          Etiquetar bloque
          <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" aria-hidden />
        </button>
        {tagOpen ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-md)]"
            onMouseLeave={() => setTagOpen(false)}
          >
            <button
              type="button"
              onClick={() => applyTheme(null)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
            >
              <span className="h-2.5 w-2.5 rounded-full border border-[var(--border-strong)]" aria-hidden />
              Sin etiqueta
            </button>
            {BLOCK_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTheme(t.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.colorVar }} aria-hidden />
                {t.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden />

      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        <Filter className="h-3 w-3" aria-hidden />
        Filtrar
      </span>
      <button
        type="button"
        onClick={() => onChangeFilter(null)}
        className={cn(
          "rounded-full px-2.5 py-0.5 text-[11px] transition-colors",
          activeFilter === null
            ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
        )}
      >
        Todo
      </button>
      {BLOCK_THEMES.map((t) => {
        const active = activeFilter === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeFilter(active ? null : t.id)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] transition-colors",
              active
                ? "bg-[var(--bg-input)] text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
            style={
              active
                ? { boxShadow: `inset 0 0 0 1px ${t.colorVar}` }
                : undefined
            }
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.colorVar }} aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
