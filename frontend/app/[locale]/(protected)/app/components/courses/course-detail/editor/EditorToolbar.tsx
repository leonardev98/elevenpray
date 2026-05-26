"use client";

import { Fragment, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlertTriangle,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Lightbulb,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pin,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalloutVariant } from "./types";

interface EditorToolbarProps {
  editor: Editor | null;
  /** Modo minimal: oculta callouts, imagen, separador (para MiniEditor). */
  variant?: "full" | "mini";
  /** Permite a la página dueña insertar imágenes con upload custom. */
  onRequestImage?: () => void;
}

const CALLOUT_OPTIONS: { variant: CalloutVariant; icon: typeof Lightbulb; label: string }[] = [
  { variant: "idea", icon: Lightbulb, label: "Idea" },
  { variant: "warning", icon: AlertTriangle, label: "Advertencia" },
  { variant: "pin", icon: Pin, label: "Anclado" },
  { variant: "info", icon: Info, label: "Información" },
];

interface ToolButtonProps {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolButton({ onClick, active, label, children, disabled }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors",
        "hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-[var(--accent-subtle)] text-[var(--accent)]",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, variant = "full", onRequestImage }: EditorToolbarProps) {
  const [calloutOpen, setCalloutOpen] = useState(false);

  if (!editor) return null;

  return (
    <div
      role="toolbar"
      aria-label="Formato de texto"
      className="flex flex-wrap items-center gap-0.5 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-1"
    >
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label="Título 1"
      >
        <Heading1 className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Título 2"
      >
        <Heading2 className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Título 3"
      >
        <Heading3 className="h-4 w-4" aria-hidden />
      </ToolButton>

      <span className="mx-0.5 h-5 w-px bg-[var(--border)]" aria-hidden />

      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Negrita"
      >
        <Bold className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Cursiva"
      >
        <Italic className="h-4 w-4" aria-hidden />
      </ToolButton>
      {variant === "full" && (
        <Fragment>
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            label="Tachado"
          >
            <Strikethrough className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            label="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" aria-hidden />
          </ToolButton>
        </Fragment>
      )}

      <span className="mx-0.5 h-5 w-px bg-[var(--border)]" aria-hidden />

      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Lista con viñetas"
      >
        <List className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        label="Checklist"
      >
        <ListChecks className="h-4 w-4" aria-hidden />
      </ToolButton>

      <span className="mx-0.5 h-5 w-px bg-[var(--border)]" aria-hidden />

      <ToolButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="Cita"
      >
        <Quote className="h-4 w-4" aria-hidden />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="Bloque de código"
      >
        <Code className="h-4 w-4" aria-hidden />
      </ToolButton>

      {variant === "full" && (
        <Fragment>
          <div className="relative">
            <ToolButton
              onClick={() => setCalloutOpen((v) => !v)}
              active={editor.isActive("callout") || calloutOpen}
              label="Callout"
            >
              <Lightbulb className="h-4 w-4" aria-hidden />
            </ToolButton>
            {calloutOpen ? (
              <div
                className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-md)]"
                onMouseLeave={() => setCalloutOpen(false)}
              >
                {CALLOUT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.variant}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleCallout({ variant: opt.variant }).run();
                        setCalloutOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                    >
                      <Icon className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <span className="mx-0.5 h-5 w-px bg-[var(--border)]" aria-hidden />

          <ToolButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label="Separador"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </ToolButton>
          <ToolButton onClick={() => onRequestImage?.()} label="Insertar imagen">
            <ImageIcon className="h-4 w-4" aria-hidden />
          </ToolButton>
        </Fragment>
      )}
    </div>
  );
}
