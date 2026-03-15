"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Save, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/auth-provider";
import {
  usePromptFolders,
  usePromptCategories,
  useDeveloperProjects,
} from "@/app/lib/developer-workspace";
import { PromptFormDrawer } from "../../prompts/components/PromptFormDrawer";
import { cn } from "@/lib/utils";

export interface PromptComposerProps {
  className?: string;
  /** Controlled value (when provided with onChange). */
  value?: string;
  /** Controlled onChange (when provided, component is controlled). */
  onChange?: (value: string) => void;
  onSaveSuccess?: () => void;
}

export function PromptComposer({
  className,
  value: controlledValue,
  onChange: controlledOnChange,
  onSaveSuccess,
}: PromptComposerProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const { token } = useAuth();
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = controlledOnChange ?? setInternalValue;
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);
  const [openAsPin, setOpenAsPin] = useState(false);

  const { data: folders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects } = useDeveloperProjects(token);

  return (
    <>
      <section
        className={cn(
          "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]",
          className
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("promptComposerPlaceholder")}
          className="min-h-[120px] w-full resize-y rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/60 px-4 py-3 text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/10"
          rows={4}
          aria-label={t("promptComposerPlaceholder")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpenAsPin(false);
              setSaveDrawerOpen(true);
            }}
            className="gap-1.5 border-[var(--dev-border-subtle)] text-[var(--app-fg)]"
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
            className="gap-1.5 border-[var(--dev-border-subtle)] text-[var(--app-fg)]"
            title={t("pinPrompt")}
          >
            <Pin className="h-3.5 w-3.5" />
            {t("pinPrompt")}
          </Button>
        </div>
      </section>

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
