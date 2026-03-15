"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, MessageSquare, Code2, TestTube, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "elevenpray_developer_scratchpad";
const DEV_NOTES_WRITTEN_KEY = "elevenpray_dev_notes_written";
const DEBOUNCE_MS = 600;

function incrementNotesWrittenToday() {
  const key = `${DEV_NOTES_WRITTEN_KEY}_${new Date().toISOString().slice(0, 10)}`;
  try {
    const n = parseInt(localStorage.getItem(key) ?? "0", 10);
    localStorage.setItem(key, String(n + 1));
  } catch {
    // ignore
  }
}

export interface DevScratchpadProps {
  className?: string;
}

export function DevScratchpad({ className }: DevScratchpadProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored != null) {
        setValue(stored);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    if (!loaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore
      }
      saveTimeoutRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [value, loaded]);

  const getSelectedText = useCallback((): string => {
    const view = editorRef.current?.view;
    if (!view) return "";
    const { from, to } = view.state.selection.main;
    if (from === to) return "";
    return view.state.doc.sliceString(from, to);
  }, []);

  const sendSelectionToAI = useCallback(
    (action: string) => {
      const text = getSelectedText();
      if (!text.trim()) {
        toast(t("selectTextFirst"));
        return;
      }
      incrementNotesWrittenToday();
      toast(t("sentToAI"), { description: action });
    },
    [getSelectedText, t]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        sendSelectionToAI(t("sendToAI"));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        try {
          localStorage.setItem(STORAGE_KEY, value);
          toast(t("saved"));
        } catch {
          // ignore
        }
      }
    },
    [sendSelectionToAI, value, t]
  );

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] overflow-hidden shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--dev-border-subtle)] px-4 py-2">
        <h2 className="text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/80">
          {t("devScratchpad")}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--dev-border-subtle)] bg-transparent px-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("sendToAI")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem onClick={() => sendSelectionToAI(t("explainCode"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("explainCode")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sendSelectionToAI(t("refactorCode"))}>
              <Code2 className="mr-2 h-4 w-4" />
              {t("refactorCode")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sendSelectionToAI(t("generateTests"))}>
              <TestTube className="mr-2 h-4 w-4" />
              {t("generateTests")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sendSelectionToAI(t("improvePerformance"))}>
              <Zap className="mr-2 h-4 w-4" />
              {t("improvePerformance")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div onKeyDown={handleKeyDown} className="[&_.cm-editor]:min-h-[280px] [&_.cm-scroller]:min-h-[280px]">
        <CodeMirror
          ref={editorRef}
          value={value}
          height="280px"
          minHeight="280px"
          onChange={(v) => setValue(v)}
          extensions={[markdown()]}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
          }}
          placeholder={t("devScratchpadPlaceholder")}
          theme="light"
          className="text-[length:var(--dev-font-body-size)] [&_.cm-content]:min-h-[260px]"
        />
      </div>
      <p
        className="border-t border-[var(--dev-border-subtle)] px-4 py-2 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
        style={{ opacity: 0.6 }}
      >
        Cmd+Enter {t("sendToAI")} · Cmd+S {t("saved")}
      </p>
    </section>
  );
}
