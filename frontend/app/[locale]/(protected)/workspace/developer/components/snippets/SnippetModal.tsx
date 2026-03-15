"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Snippet } from "@/app/lib/developer-workspace/types";

export interface SnippetModalProps {
  snippet: Snippet | null;
  open: boolean;
  onClose: () => void;
  copyToastMessage?: string;
  copySnippetLabel?: string;
  closeLabel?: string;
}

export function SnippetModal({
  snippet,
  open,
  onClose,
  copyToastMessage = "Copied to clipboard ✔",
  copySnippetLabel = "Copy snippet",
  closeLabel = "Close",
}: SnippetModalProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const extensions = useMemo(() => {
    if (!snippet) return [EditorView.lineWrapping];
    const lang = snippet.language?.toLowerCase() ?? "";
    const wrap = EditorView.lineWrapping;
    if (lang === "javascript" || lang === "typescript" || lang === "ts" || lang === "js") {
      return [wrap, javascript()];
    }
    return [wrap];
  }, [snippet?.language]);

  const handleCopy = async () => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      toast.success(copyToastMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!snippet) return null;

  const lineCount = snippet.content.split("\n").length;
  const codeHeight = Math.min(Math.max(lineCount * 22, 200), 480);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="snippet-modal-title"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-[var(--snippets-border)] bg-[var(--snippets-card)] shadow-xl max-h-[90vh]"
          >
            <div className="flex shrink-0 flex-col gap-2 border-b border-[var(--snippets-border)] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <h2 id="snippet-modal-title" className="font-semibold text-[var(--snippets-fg)] truncate min-w-0">
                  {snippet.title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-[var(--snippets-fg-muted)] hover:bg-[var(--snippets-border)]/50 hover:text-[var(--snippets-fg)] shrink-0"
                  aria-label={closeLabel}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-md bg-[var(--snippets-tag-bg)] px-2 py-0.5 text-xs font-medium text-[var(--snippets-tag-fg)]"
                  title="Language"
                >
                  {snippet.language}
                </span>
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--snippets-tag-bg)] px-2 py-0.5 text-xs text-[var(--snippets-tag-fg)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden p-4 pt-2">
              <div
                data-lenis-prevent
                className="max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-lg border border-[var(--snippets-code-block-border)] bg-[var(--snippets-code-block-bg)] [&_.cm-scroller]:overflow-x-hidden"
              >
                <CodeMirror
                  value={snippet.content}
                  height={`${codeHeight}px`}
                  editable={false}
                  readOnly
                  extensions={extensions}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    highlightActiveLine: false,
                  }}
                  className="rounded-lg text-sm [&_.cm-editor]:outline-none [&_.cm-content]:text-[var(--snippets-fg)] [&_.cm-gutters]:bg-[var(--snippets-code-block-bg)] [&_.cm-gutters]:text-[var(--snippets-tag-fg)] [&_.cm-gutters]:border-r-[var(--snippets-code-block-border)]"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 border-t border-[var(--snippets-border)] px-4 py-3">
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  copied
                    ? "bg-[var(--snippets-success)]/20 text-[var(--snippets-success)]"
                    : "bg-[var(--snippets-modal-btn-bg)] text-[var(--snippets-modal-btn-fg)] hover:bg-[var(--snippets-modal-btn-hover-bg)] hover:text-[var(--snippets-fg)]"
                )}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : copySnippetLabel}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--snippets-border)] px-4 py-2 text-sm font-medium text-[var(--snippets-modal-btn-fg)] transition-colors hover:bg-[var(--snippets-modal-btn-hover-bg)] hover:text-[var(--snippets-fg)]"
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
