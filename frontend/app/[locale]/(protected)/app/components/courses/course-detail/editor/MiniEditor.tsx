"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Callout } from "./Callout";
import { EditorToolbar } from "./EditorToolbar";
import "./editor-styles.css";

interface MiniEditorProps {
  /** Identificador para forzar reset cuando cambia. */
  editorKey: string;
  contentJson: JSONContent | null;
  placeholder?: string;
  onChange: (next: JSONContent) => void;
}

export function MiniEditor({ editorKey, contentJson, placeholder, onChange }: MiniEditorProps) {
  const lastKeyRef = useRef(editorKey);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder ?? "Escribe tus apuntes de esta sesión…",
          emptyEditorClass: "is-editor-empty",
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Callout,
      ],
      content: contentJson ?? { type: "doc", content: [{ type: "paragraph" }] },
      editorProps: {
        attributes: {
          class: "tt-editor-prose focus:outline-none",
          spellcheck: "true",
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getJSON());
      },
      immediatelyRender: false,
    },
    [editorKey],
  );

  useEffect(() => {
    if (!editor) return;
    if (lastKeyRef.current !== editorKey) {
      lastKeyRef.current = editorKey;
      editor.commands.setContent(contentJson ?? { type: "doc", content: [{ type: "paragraph" }] }, {
        emitUpdate: false,
      });
    }
  }, [editor, editorKey, contentJson]);

  return (
    <div className="space-y-2">
      <EditorToolbar editor={editor} variant="mini" />
      <div className="tt-editor rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
