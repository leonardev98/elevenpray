"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Save, Pin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import {
  usePromptFolders,
  usePromptCategories,
  useDeveloperProjects,
} from "@/app/lib/developer-workspace";
import { PromptFormDrawer } from "../../prompts/components/PromptFormDrawer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MIN_ROWS = 3;
const MAX_HEIGHT = 280;

export interface PromptEditorCardProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSaveSuccess?: () => void;
}

export function PromptEditorCard({
  className,
  value: controlledValue,
  onChange: controlledOnChange,
  onSaveSuccess,
}: PromptEditorCardProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const { token } = useAuth();
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledOnChange ?? setInternalValue;
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);
  const [openAsPin, setOpenAsPin] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: folders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects } = useDeveloperProjects(token);

  // Autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = Math.min(MAX_HEIGHT, Math.max(el.scrollHeight, MIN_ROWS * 24));
    el.style.height = `${h}px`;
  }, [value]);

  const handleSendToAI = () => {
    if (!value.trim()) {
      toast(t("promptComposerPlaceholder"));
      return;
    }
    toast(t("sentToAI"), { description: t("sendToAI") });
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("dev-dash-card p-4", className)}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("promptComposerPlaceholder")}
          rows={MIN_ROWS}
          className="w-full min-h-[72px] max-h-[280px] resize-none rounded-xl border border-[var(--dev-dash-border)] bg-[var(--dev-dash-inner-bg)] px-4 py-3 text-sm text-[var(--dev-dash-fg)] placeholder:text-[var(--dev-dash-fg-muted)]/50 focus:border-[var(--dev-dash-accent-indigo)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--dev-dash-accent-indigo)]/30 font-mono"
          style={{ fontFamily: "var(--font-jetbrains-mono), var(--font-geist-mono), ui-monospace, monospace" }}
          aria-label={t("promptComposerPlaceholder")}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[var(--dev-dash-fg-muted)] tabular-nums">
            {value.length} {t("characterCount")}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpenAsPin(false);
                setSaveDrawerOpen(true);
              }}
              className="gap-1.5 border-[var(--dev-dash-border)] bg-transparent text-[var(--dev-dash-fg)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
            >
              <Save className="h-3.5 w-3.5" />
              {t("savePrompt")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpenAsPin(true);
                setSaveDrawerOpen(true);
              }}
              className="gap-1.5 border-[var(--dev-dash-border)] bg-transparent text-[var(--dev-dash-fg)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
              title={t("pinPrompt")}
            >
              <Pin className="h-3.5 w-3.5" />
              {t("pinPrompt")}
            </Button>
            <Button
              size="sm"
              onClick={handleSendToAI}
              className="gap-1.5 bg-[var(--dev-dash-accent-indigo)] text-white hover:bg-[var(--dev-dash-accent-indigo)]/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t("sendToAI")}
            </Button>
          </div>
        </div>
      </motion.section>

      {token && (
        <PromptFormDrawer
          open={saveDrawerOpen}
          onClose={() => setSaveDrawerOpen(false)}
          prompt={null}
          initialContent={value.trim() || undefined}
          initialPinned={openAsPin}
          folders={folders ?? []}
          categories={categories ?? []}
          projects={projects ?? []}
          tagSuggestions={[]}
          token={token}
          onSuccess={() => {
            setSaveDrawerOpen(false);
            onSaveSuccess?.();
          }}
        />
      )}
    </>
  );
}
