"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { cn } from "@/lib/utils";

const MAX_PREVIEW_LINES = 4;
const LINE_HEIGHT = 1.5;
const FONT_SIZE_PX = 13;
const PREVIEW_HEIGHT_PX = Math.ceil(MAX_PREVIEW_LINES * LINE_HEIGHT * FONT_SIZE_PX);
const PADDING_PX = 12;

export interface SnippetPreviewProps {
  content: string;
  language: string;
  className?: string;
}

function getPreviewContent(content: string, maxLines: number): string {
  const lines = content.split("\n");
  if (lines.length <= maxLines) return content;
  return lines.slice(0, maxLines).join("\n");
}

function getLanguageExtension(language: string) {
  const lang = language?.toLowerCase() ?? "";
  if (lang === "javascript" || lang === "typescript" || lang === "ts" || lang === "js") {
    return javascript();
  }
  return null;
}

export function SnippetPreview({ content, language, className }: SnippetPreviewProps) {
  const preview = useMemo(() => getPreviewContent(content, MAX_PREVIEW_LINES), [content]);

  const extensions = useMemo(() => {
    const ext = getLanguageExtension(language);
    const wrap = EditorView.lineWrapping;
    return ext ? [wrap, ext] : [wrap];
  }, [language]);

  return (
    <div
      className={cn(
        "snippet-preview-wrapper overflow-hidden rounded-lg border bg-[var(--snippets-preview-bg)] border-[var(--snippets-preview-border)]",
        className
      )}
      style={{ minHeight: PREVIEW_HEIGHT_PX + PADDING_PX * 2 }}
    >
      <CodeMirror
        value={preview}
        height={`${PREVIEW_HEIGHT_PX}px`}
        editable={false}
        readOnly
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
        }}
        className={cn(
          "[&_.cm-editor]:outline-none [&_.cm-editor]:bg-transparent [&_.cm-scroller]:overflow-hidden [&_.cm-scroller]:overflow-x-hidden",
          "[&_.cm-content]:text-[var(--snippets-fg-muted)] [&_.cm-gutters]:hidden",
          "snippet-preview-cm"
        )}
      />
    </div>
  );
}
