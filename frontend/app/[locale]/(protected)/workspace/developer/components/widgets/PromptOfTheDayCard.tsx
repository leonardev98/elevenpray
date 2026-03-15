"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { useDiscoveryPrompts } from "@/app/lib/developer-workspace";
import { Sparkles, Copy, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  usePromptFolders,
  usePromptCategories,
  useDeveloperProjects,
} from "@/app/lib/developer-workspace";
import { PromptFormDrawer } from "../../prompts/components/PromptFormDrawer";
import { cn } from "@/lib/utils";

const FALLBACK_PROMPT = "Optimize this React component for performance.";

export function PromptOfTheDayCard({ className }: { className?: string }) {
  const t = useTranslations("developerWorkspace.dashboard");
  const locale = useLocale();
  const { token } = useAuth();
  const { data: prompts } = useDiscoveryPrompts(token, locale, "prompts_of_the_day");
  const [saveDrawerOpen, setSaveDrawerOpen] = useState(false);
  const { data: folders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects } = useDeveloperProjects(token);

  const prompt = prompts?.[0];
  const content = prompt?.content?.trim() || FALLBACK_PROMPT;
  const title = prompt?.title || null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast(t("copied"));
    } catch {
      toast(t("copyError"));
    }
  };

  const handleSaveToVault = () => {
    setSaveDrawerOpen(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className={cn("dev-dash-card p-4", className)}
      >
        <div className="flex items-center gap-2 text-[var(--dev-dash-fg-muted)] mb-2">
          <Sparkles className="h-4 w-4 text-[var(--dev-dash-accent-indigo)]" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {t("promptOfTheDay")}
          </span>
        </div>
        <p className="text-sm text-[var(--dev-dash-fg)] leading-relaxed line-clamp-3 font-mono">
          {content}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1.5 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
          >
            <Copy className="h-3.5 w-3.5" />
            {t("copy")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToVault}
            className="h-8 gap-1.5 text-[var(--dev-dash-fg-muted)] hover:bg-[var(--dev-dash-hover-bg)] hover:text-[var(--dev-dash-fg)]"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            {t("saveToVault")}
          </Button>
        </div>
      </motion.section>

      {token && (
        <PromptFormDrawer
          open={saveDrawerOpen}
          onClose={() => setSaveDrawerOpen(false)}
          prompt={null}
          initialContent={content}
          initialTitle={title ?? undefined}
          folders={folders ?? []}
          categories={categories ?? []}
          projects={projects ?? []}
          tagSuggestions={[]}
          token={token}
          onSuccess={() => setSaveDrawerOpen(false)}
        />
      )}
    </>
  );
}
