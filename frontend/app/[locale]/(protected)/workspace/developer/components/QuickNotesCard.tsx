"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickNotesCardProps {
  className?: string;
}

export function QuickNotesCard({ className }: QuickNotesCardProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const tCommon = useTranslations("common");
  const [value, setValue] = useState("");

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-5 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="flex items-center gap-2 text-[length:var(--dev-font-display-size)] font-medium tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)]">
        <StickyNote className="h-4 w-4 shrink-0" />
        {t("quickNotes")}
      </h2>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("quickNotesPlaceholder")}
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-4 py-3 text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] placeholder:text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/15"
        style={{ opacity: 1 }}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <Link
          href="/workspace/developer/notes"
          className="text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-fg)] transition-colors hover:text-[var(--app-navy)]"
          style={{ opacity: 0.7 }}
        >
          {tCommon("viewAllNotes")} →
        </Link>
      </div>
    </motion.section>
  );
}
