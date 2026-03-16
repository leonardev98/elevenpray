"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Save, MessageSquare, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "elevenpray_developer_scratchpad";
const DEBOUNCE_MS = 600;

export function DevScratchpadCard({ className }: { className?: string }) {
  const t = useTranslations("developerWorkspace.dashboard");
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const scroller = el.querySelector(".cm-scroller") as HTMLElement | null;
      if (!scroller) return;
      const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = scroller;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop + clientHeight < scrollHeight;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth;
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;
      const scrollingLeft = e.deltaX < 0;
      const scrollingRight = e.deltaX > 0;
      const shouldConsumeVertical =
        (canScrollUp && scrollingUp) || (canScrollDown && scrollingDown);
      const shouldConsumeHorizontal =
        (canScrollLeft && scrollingLeft) || (canScrollRight && scrollingRight);
      if (shouldConsumeVertical || shouldConsumeHorizontal) {
        e.preventDefault();
        if (shouldConsumeVertical) scroller.scrollTop += e.deltaY;
        if (shouldConsumeHorizontal) scroller.scrollLeft += e.deltaX;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored != null) setValue(stored);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

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

  const sendToAI = useCallback(
    (action: string) => {
      const text = getSelectedText() || value;
      if (!text.trim()) {
        toast(t("selectTextFirst"));
        return;
      }
      toast(t("sentToAI"), { description: action });
    },
    [getSelectedText, value, t]
  );

  const handleSaveSnippet = () => {
    if (!value.trim()) {
      toast(t("selectTextFirst"));
      return;
    }
    toast(t("saved"));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className={cn("dev-dash-card overflow-hidden", className)}
    >
      <div className="flex items-center justify-between border-b border-[var(--dev-dash-border)] px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--dev-dash-fg-muted)]">
          {t("devScratchpad")}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveSnippet}
            className="h-8 gap-1.5 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)] text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {t("saveSnippet")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("sendToAI")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px] bg-[var(--dev-dash-card)] border-[var(--dev-dash-border)]">
              <DropdownMenuItem onClick={() => sendToAI(t("explainCode"))} className="text-[var(--dev-dash-fg)] focus:bg-[var(--dev-dash-hover-bg)]">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("explainCode")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sendToAI(t("refactorCode"))} className="text-[var(--dev-dash-fg)] focus:bg-[var(--dev-dash-hover-bg)]">
                <Code2 className="mr-2 h-4 w-4" />
                {t("refactorCode")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div ref={scrollContainerRef} className="overflow-hidden [&_.cm-content]:font-mono">
        <CodeMirror
          ref={editorRef}
          value={value}
          height="200px"
          minHeight="200px"
          onChange={setValue}
          extensions={[javascript()]}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            bracketMatching: true,
          }}
          placeholder={t("devScratchpadPlaceholder")}
          className="text-sm [&_.cm-content]:text-[var(--dev-dash-fg)] [&_.cm-gutters]:bg-transparent [&_.cm-editor]:outline-none"
        />
      </div>
      <p className="border-t border-[var(--dev-dash-border)] px-4 py-1.5 text-xs text-[var(--dev-dash-fg-muted)]">
        Cmd+Enter {t("sendToAI")} · Cmd+S {t("saved")}
      </p>
    </motion.section>
  );
}
