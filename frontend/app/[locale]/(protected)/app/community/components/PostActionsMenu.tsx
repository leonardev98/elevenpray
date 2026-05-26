"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface PostActionsMenuProps {
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export function PostActionsMenu({
  isAuthor,
  onEdit,
  onDelete,
  onReport,
}: PostActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Más opciones"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-lg p-1 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-md)]"
        >
          {isAuthor && onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-surface-soft)]"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Editar
            </button>
          )}
          {isAuthor && onDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--app-surface-soft)]"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Eliminar
            </button>
          )}
          {!isAuthor && onReport && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onReport();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-surface-soft)]"
            >
              <Flag className="h-4 w-4" aria-hidden />
              Reportar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
