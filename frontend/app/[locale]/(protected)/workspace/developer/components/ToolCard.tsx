"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ToolCardProps {
  titleKey: string;
  description: string;
  icon: LucideIcon;
  index?: number;
  children?: React.ReactNode;
}

export function ToolCard({
  titleKey,
  description,
  icon: Icon,
  index = 0,
  children,
}: ToolCardProps) {
  const t = useTranslations("developerWorkspace.tools");

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10">
          <Icon className="h-5 w-5 text-[var(--app-navy)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--app-fg)]">{t(titleKey)}</h3>
          <p className="mt-0.5 text-sm text-[var(--app-fg)]/60">{description}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </motion.article>
  );
}
