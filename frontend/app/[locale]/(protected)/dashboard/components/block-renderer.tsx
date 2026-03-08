"use client";

import type { BlockApi } from "../../../../lib/blocks-api";

interface BlockRendererProps {
  block: BlockApi;
  onContentChange: (content: Record<string, unknown>) => void;
  onDelete?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function getText(content: Record<string, unknown>): string {
  const t = content.text ?? content.title;
  return typeof t === "string" ? t : "";
}

function getChecklistItems(content: Record<string, unknown>): { id: string; text: string; checked: boolean }[] {
  const items = content.items;
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    if (it && typeof it === "object" && "id" in it && "text" in it && "checked" in it) {
      return {
        id: String((it as { id: unknown }).id),
        text: String((it as { text: unknown }).text),
        checked: Boolean((it as { checked: unknown }).checked),
      };
    }
    return { id: crypto.randomUUID(), text: "", checked: false };
  });
}

export function BlockRenderer({
  block,
  onContentChange,
  onDelete,
  onKeyDown,
  placeholder = "Escribe aquí…",
  autoFocus,
}: BlockRendererProps) {
  if (block.type === "heading") {
    const text = getText(block.content);
    return (
      <div className="group flex items-center gap-2 py-1">
        <input
          type="text"
          value={text}
          onChange={(e) => onContentChange({ ...block.content, text: e.target.value })}
          onBlur={() => onContentChange(block.content)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          placeholder="Título"
          className="min-w-0 flex-1 rounded border-0 bg-transparent px-1 py-0.5 text-lg font-semibold text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        />
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Eliminar"
            className="rounded p-1 text-[var(--app-fg)]/40 opacity-0 hover:text-red-500 group-hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  if (block.type === "checklist") {
    const items = getChecklistItems(block.content);
    return (
      <div className="group rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--app-fg)]/50">
            Lista de tareas
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Eliminar bloque"
              className="rounded p-1 text-[var(--app-fg)]/40 hover:text-red-500 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          )}
        </div>
        <ul className="mt-2 space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {
                  const next = items.map((i) =>
                    i.id === item.id ? { ...i, checked: !i.checked } : i
                  );
                  onContentChange({ ...block.content, items: next });
                }}
                className="h-4 w-4 rounded border-[var(--app-border)] text-[var(--app-gold)] focus:ring-[var(--app-gold)]"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  const next = items.map((i) =>
                    i.id === item.id ? { ...i, text: e.target.value } : i
                  );
                  onContentChange({ ...block.content, items: next });
                }}
                placeholder="Elemento"
                className="min-w-0 flex-1 rounded border-0 bg-transparent px-1 py-0.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const next = [...items, { id: crypto.randomUUID(), text: "", checked: false }];
            onContentChange({ ...block.content, items: next });
          }}
          className="mt-2 text-xs text-[var(--app-fg)]/50 hover:text-[var(--app-gold)]"
        >
          + Añadir ítem
        </button>
      </div>
    );
  }

  // text (default)
  const text = getText(block.content);
  return (
    <div className="group flex items-start gap-2 py-1">
      <textarea
        value={text}
        onChange={(e) => onContentChange({ ...block.content, text: e.target.value })}
        onBlur={() => onContentChange(block.content)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        placeholder={placeholder}
        rows={1}
        className="min-w-0 flex-1 resize-none rounded border-0 bg-transparent px-1 py-0.5 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
        style={{ minHeight: "1.5rem" }}
      />
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar"
          className="mt-1 rounded p-1 text-[var(--app-fg)]/40 opacity-0 hover:text-red-500 group-hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
