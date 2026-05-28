"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Focus,
  Loader2,
  PanelRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Callout } from "./Callout";
import { BlockTheme } from "./BlockTheme";
import { EditorToolbar } from "./EditorToolbar";
import { SlashMenu } from "./SlashMenu";
import { DocOutline } from "./DocOutline";
import { ThemeFilterBar } from "./ThemeFilterBar";
import type { BlockTheme as BlockThemeId } from "./types";
import "./editor-styles.css";
export type SaveStatus = "idle" | "saving" | "saved";

interface NoteEditorProps {
  noteId: string;
  title: string;
  contentJson: JSONContent | null;
  /** Color por curso para acentuar el header. */
  accentHex?: string;
  /** Texto adicional debajo del título (clase vinculada). */
  meta?: { classLabel?: string | null; dateText?: string };
  onTitleChange: (next: string) => void;
  onContentChange: (next: JSONContent) => void;
  onClose: () => void;
  onDelete?: () => void;
  /** Variante reducida (sin imagen ni callouts). */
  variant?: "full" | "mini";
}

export function NoteEditor({
  noteId,
  title,
  contentJson,
  accentHex,
  meta,
  onTitleChange,
  onContentChange,
  onClose,
  onDelete,
  variant = "full",
}: NoteEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [focusMode, setFocusMode] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<BlockThemeId | null>(null);
  const [titleDraft, setTitleDraft] = useState(title);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNoteIdRef = useRef(noteId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza draft con título canónico al cambiar de nota
    setTitleDraft(title);
  }, [noteId, title]);

  const placeholder = useMemo(
    () =>
      variant === "mini"
        ? "Escribe el contenido de esta clase…"
        : "Empieza a escribir o usa / para insertar bloques…",
    [variant],
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          codeBlock: { HTMLAttributes: { class: "tt-codeblock" } },
        }),
        Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
        TaskList,
        TaskItem.configure({ nested: true }),
        ...(variant === "full" ? [Image.configure({ inline: false, allowBase64: true })] : []),
        Callout,
        BlockTheme,
      ],
      content: contentJson ?? { type: "doc", content: [{ type: "paragraph" }] },
      autofocus: "end",
      editorProps: {
        attributes: {
          class: "tt-editor-prose focus:outline-none",
          spellcheck: "true",
        },
      },
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        setSaveStatus("saving");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => {
          onContentChange(json);
          setSaveStatus("saved");
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSaveStatus("idle"), 1500);
        }, 600);
      },
      immediatelyRender: false,
    },
    [noteId],
  );

  useEffect(() => {
    if (!editor) return;
    if (lastNoteIdRef.current !== noteId) {
      lastNoteIdRef.current = noteId;
      editor.commands.setContent(contentJson ?? { type: "doc", content: [{ type: "paragraph" }] }, {
        emitUpdate: false,
      });
    }
  }, [editor, noteId, contentJson]);

  useEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  }, []);

  const commitTitle = useCallback(() => {
    const next = titleDraft.trim() || "Nota sin título";
    setTitleDraft(next);
    if (next !== title) onTitleChange(next);
  }, [titleDraft, title, onTitleChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !outlineOpen && !focusMode) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, outlineOpen, focusMode]);

  function handleImageRequest() {
    fileInputRef.current?.click();
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      if (src) editor.chain().focus().setImage({ src, alt: file.name }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[300] flex flex-col bg-[var(--bg-base)]"
      role="dialog"
      aria-modal="true"
      aria-label="Editor de apunte"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImagePick}
        className="hidden"
      />

      <header
        className={cn(
          "flex items-center gap-3 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 sm:px-6",
          focusMode && "opacity-60 transition-opacity hover:opacity-100",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
          aria-label="Cerrar editor"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver
        </button>

        <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SaveIndicator status={saveStatus} />
          {meta?.classLabel ? (
            <span className="hidden truncate rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline-block">
              {meta.classLabel}
            </span>
          ) : null}
          {meta?.dateText ? (
            <span className="hidden text-[11px] text-[var(--text-muted)] sm:inline-block">{meta.dateText}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
              focusMode
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
            )}
            aria-pressed={focusMode}
          >
            <Focus className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Foco</span>
          </button>
          {variant === "full" && (
            <button
              type="button"
              onClick={() => setOutlineOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                outlineOpen
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
              )}
              aria-pressed={outlineOpen}
            >
              <PanelRight className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Resumen</span>
            </button>
          )}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--error)]"
              aria-label="Eliminar apunte"
              title="Eliminar apunte"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-hidden",
            focusMode && "items-center",
          )}
        >
          <div
            className={cn(
              "tt-editor-scroll flex-1 overflow-y-auto",
              focusMode ? "w-full max-w-3xl px-6 pt-10" : "px-4 pt-6 sm:px-8",
            )}
          >
            <div className={cn("mx-auto w-full", focusMode ? "max-w-3xl" : "max-w-3xl")}>
              {accentHex ? (
                <div
                  className="mb-4 h-1 w-12 rounded-full"
                  style={{ backgroundColor: accentHex }}
                  aria-hidden
                />
              ) : null}
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTitle();
                    editor?.commands.focus("end");
                  }
                }}
                placeholder="Título del apunte"
                className="w-full border-0 bg-transparent text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              />

              {!focusMode && variant === "full" ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <EditorToolbar editor={editor} variant="full" onRequestImage={handleImageRequest} />
                  <ThemeFilterBar
                    editor={editor}
                    activeFilter={themeFilter}
                    onChangeFilter={setThemeFilter}
                  />
                </div>
              ) : null}

              {focusMode ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Modo foco activo — solo tú y tu apunte.
                </p>
              ) : null}

              <div
                className="tt-editor mt-4 pb-24"
                data-focus-mode={focusMode ? "true" : "false"}
                {...(themeFilter ? { "data-theme-filter": themeFilter } : {})}
              >
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <SlashMenu editor={editor} enabled={variant === "full"} onRequestImage={handleImageRequest} />
        </div>

        <AnimatePresence>
          {outlineOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hidden h-full shrink-0 overflow-hidden md:block"
            >
              <DocOutline editor={editor} open={outlineOpen} onClose={() => setOutlineOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--text-disabled)]" aria-hidden />
        Sin cambios
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Guardando…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)]">
      <Check className="h-3 w-3" aria-hidden />
      Guardado
    </span>
  );
}
