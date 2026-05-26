"use client";

import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { CheckCircle2, Circle, Hash, ListTodo, PanelRightClose, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocOutlineProps {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}

type OutlineHeading = {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  pos: number;
};

type OutlineTask = {
  id: string;
  text: string;
  checked: boolean;
  pos: number;
};

function textOfNode(node: JSONContent): string {
  if (node.type === "text" && typeof node.text === "string") return node.text;
  if (Array.isArray(node.content)) return node.content.map(textOfNode).join("");
  return "";
}

function collect(editor: Editor): { headings: OutlineHeading[]; tasks: OutlineTask[] } {
  const headings: OutlineHeading[] = [];
  const tasks: OutlineTask[] = [];
  let hi = 0;
  let ti = 0;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      const level = (node.attrs.level as 1 | 2 | 3) ?? 2;
      const txt = textOfNode(node.toJSON() as JSONContent).trim();
      headings.push({ id: `h-${hi++}`, level: level > 3 ? 3 : level, text: txt || "Sin título", pos });
    }
    if (node.type.name === "taskItem") {
      const txt = textOfNode(node.toJSON() as JSONContent).trim();
      const checked = Boolean(node.attrs.checked);
      tasks.push({ id: `t-${ti++}`, text: txt || "(sin texto)", checked, pos });
    }
    return true;
  });
  return { headings, tasks };
}

export function DocOutline({ editor, open, onClose }: DocOutlineProps) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const handler = () => setVersion((v) => v + 1);
    editor.on("update", handler);
    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("update", handler);
      editor.off("selectionUpdate", handler);
    };
  }, [editor]);

  const { headings, tasks } = useMemo(() => {
    if (!editor) return { headings: [] as OutlineHeading[], tasks: [] as OutlineTask[] };
    return collect(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version triggers recalc
  }, [editor, version]);

  const pending = tasks.filter((t) => !t.checked).length;
  const completed = tasks.length - pending;

  function jumpTo(pos: number) {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
  }

  if (!open) return null;

  return (
    <aside className="flex h-full w-full flex-col border-l-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <PanelRightClose className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Resumen rápido
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar resumen"
          className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Hash className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Tabla de contenido
            </p>
          </div>
          {headings.length === 0 ? (
            <p className="px-1 text-xs text-[var(--text-muted)]">
              Añade títulos (H1, H2, H3) para navegar tu apunte.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {headings.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(h.pos + 1)}
                    className={cn(
                      "block w-full truncate rounded-md px-2 py-1 text-left text-xs transition-colors",
                      "text-[var(--text-body)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
                      h.level === 2 && "pl-4",
                      h.level === 3 && "pl-6",
                      h.level === 1 && "font-medium text-[var(--text-primary)]",
                    )}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListTodo className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden />
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Checklist
              </p>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
              {completed}/{tasks.length}
            </span>
          </div>
          {tasks.length === 0 ? (
            <p className="px-1 text-xs text-[var(--text-muted)]">
              Crea checklists para llevar tu progreso del apunte.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {tasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(t.pos + 1)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      "hover:bg-[var(--bg-input)]",
                      t.checked ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]",
                    )}
                  >
                    {t.checked ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                    )}
                    <span className="min-w-0 break-words">{t.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {tasks.length > 0 ? (
          <div className="mt-4 rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-3">
            <p className="text-[11px] text-[var(--text-muted)]">
              Te faltan <span className="font-semibold text-[var(--text-primary)]">{pending}</span>{" "}
              {pending === 1 ? "ítem" : "ítems"} para terminar este apunte.
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{
                  width: tasks.length ? `${Math.round((completed / tasks.length) * 100)}%` : "0%",
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
