"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  AlertTriangle,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Lightbulb,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pin,
  Quote,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  editor: Editor | null;
  /** Si está habilitado el menú (modo full). */
  enabled?: boolean;
  onRequestImage?: () => void;
}

type SlashItem = {
  id: string;
  label: string;
  desc: string;
  icon: typeof Type;
  keywords: string[];
  run: (editor: Editor) => void;
};

function buildItems(onRequestImage?: () => void): SlashItem[] {
  return [
    {
      id: "p",
      label: "Texto",
      desc: "Párrafo normal",
      icon: Type,
      keywords: ["texto", "parrafo", "paragraph"],
      run: (e) => e.chain().focus().setParagraph().run(),
    },
    {
      id: "h1",
      label: "Título 1",
      desc: "Sección principal",
      icon: Heading1,
      keywords: ["h1", "heading", "titulo"],
      run: (e) => e.chain().focus().setHeading({ level: 1 }).run(),
    },
    {
      id: "h2",
      label: "Título 2",
      desc: "Subsección",
      icon: Heading2,
      keywords: ["h2", "heading", "titulo"],
      run: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: "h3",
      label: "Título 3",
      desc: "Sub-subsección",
      icon: Heading3,
      keywords: ["h3", "heading", "titulo"],
      run: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: "ul",
      label: "Lista con viñetas",
      desc: "Lista no ordenada",
      icon: List,
      keywords: ["ul", "lista", "bullet"],
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ol",
      label: "Lista numerada",
      desc: "Lista ordenada",
      icon: ListOrdered,
      keywords: ["ol", "lista", "numerada", "numero"],
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "task",
      label: "Checklist",
      desc: "Lista de tareas marcables",
      icon: ListChecks,
      keywords: ["task", "checklist", "todo", "tarea"],
      run: (e) => e.chain().focus().toggleTaskList().run(),
    },
    {
      id: "code",
      label: "Bloque de código",
      desc: "Bloque monoespaciado",
      icon: Code,
      keywords: ["code", "codigo"],
      run: (e) => e.chain().focus().setCodeBlock().run(),
    },
    {
      id: "quote",
      label: "Cita",
      desc: "Bloque destacado",
      icon: Quote,
      keywords: ["quote", "cita"],
      run: (e) => e.chain().focus().setBlockquote().run(),
    },
    {
      id: "callout-idea",
      label: "Callout: Idea",
      desc: "Destacado con icono",
      icon: Lightbulb,
      keywords: ["callout", "idea", "destacado"],
      run: (e) => e.chain().focus().setCallout({ variant: "idea" }).run(),
    },
    {
      id: "callout-warning",
      label: "Callout: Advertencia",
      desc: "Bloque de aviso",
      icon: AlertTriangle,
      keywords: ["callout", "warning", "advertencia"],
      run: (e) => e.chain().focus().setCallout({ variant: "warning" }).run(),
    },
    {
      id: "callout-pin",
      label: "Callout: Anclado",
      desc: "Marca un bloque importante",
      icon: Pin,
      keywords: ["callout", "pin", "anclado"],
      run: (e) => e.chain().focus().setCallout({ variant: "pin" }).run(),
    },
    {
      id: "callout-info",
      label: "Callout: Información",
      desc: "Bloque informativo",
      icon: Info,
      keywords: ["callout", "info", "informacion"],
      run: (e) => e.chain().focus().setCallout({ variant: "info" }).run(),
    },
    {
      id: "hr",
      label: "Separador",
      desc: "Línea horizontal",
      icon: Minus,
      keywords: ["hr", "separador", "linea"],
      run: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
      id: "img",
      label: "Imagen",
      desc: "Subir imagen desde tu equipo",
      icon: ImageIcon,
      keywords: ["image", "img", "imagen", "foto"],
      run: (e) => {
        if (onRequestImage) onRequestImage();
        else e.commands.focus();
      },
    },
  ];
}

function removeSlashAndRun(editor: Editor, run: (e: Editor) => void) {
  // Borra la barra y la query del menú antes de aplicar el cambio
  const { from } = editor.state.selection;
  const $pos = editor.state.doc.resolve(from);
  const start = $pos.start();
  const textBefore = editor.state.doc.textBetween(start, from, "\n", "\n");
  const slashIdx = textBefore.lastIndexOf("/");
  if (slashIdx >= 0) {
    const slashAbs = start + slashIdx;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: slashAbs, to: from })
      .deleteSelection()
      .run();
  }
  run(editor);
}

export function SlashMenu({ editor, enabled = true, onRequestImage }: SlashMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- montaje cliente para portal
    setMounted(true);
  }, []);

  const items = useMemo(() => buildItems(onRequestImage), [onRequestImage]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.keywords.some((k) => k.includes(q)),
    );
  }, [items, query]);

  useEffect(() => {
    if (!editor || !enabled) return;

    function handleUpdate() {
      if (!editor) return;
      const sel = editor.state.selection;
      if (!sel.empty) {
        setOpen(false);
        return;
      }
      const $pos = sel.$from;
      const parent = $pos.parent;
      if (parent.type.name !== "paragraph") {
        setOpen(false);
        return;
      }
      const start = $pos.start();
      const textBefore = editor.state.doc.textBetween(start, $pos.pos, "\n", "\n");
      const slashIdx = textBefore.lastIndexOf("/");
      if (slashIdx < 0) {
        setOpen(false);
        return;
      }
      const before = textBefore.slice(0, slashIdx);
      // Solo abrir si la barra está al inicio o tras un espacio
      if (before.length > 0 && !/\s$/.test(before)) {
        setOpen(false);
        return;
      }
      const q = textBefore.slice(slashIdx + 1);
      if (/\s/.test(q)) {
        setOpen(false);
        return;
      }
      setQuery(q);
      setActiveIdx(0);
      try {
        const coords = editor.view.coordsAtPos($pos.pos);
        setPos({ top: coords.bottom + 6, left: coords.left });
      } catch {
        // Fallback silencioso
      }
      setOpen(true);
    }

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, enabled]);

  useEffect(() => {
    if (!open || !editor) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter") {
        const item = filtered[activeIdx];
        if (!item) {
          setOpen(false);
          return;
        }
        e.preventDefault();
        if (!editor) return;
        removeSlashAndRun(editor, item.run);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, filtered, activeIdx, editor]);

  if (!enabled || !editor || !open || !pos || !mounted) return null;
  if (filtered.length === 0) return null;

  return createPortal(
    <div
      role="listbox"
      aria-label="Insertar bloque"
      className="fixed z-[400] max-h-[280px] w-[260px] overflow-y-auto rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-md)]"
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
    >
      <p className="px-2 pt-1 pb-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Bloques</p>
      {filtered.map((it, idx) => {
        const Icon = it.icon;
        const active = idx === activeIdx;
        return (
          <button
            key={it.id}
            type="button"
            role="option"
            aria-selected={active}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!editor) return;
              removeSlashAndRun(editor, it.run);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left",
              active ? "bg-[var(--bg-input)]" : "hover:bg-[var(--bg-input)]",
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-medium text-[var(--text-primary)]">{it.label}</span>
              <span className="truncate text-[10px] text-[var(--text-muted)]">{it.desc}</span>
            </span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
