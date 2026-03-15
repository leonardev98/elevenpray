"use client";

import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { getTipOfTheDay } from "../../data/tips-dev";
import { cn } from "@/lib/utils";

export function TipsDevCard({ className }: { className?: string }) {
  const t = useTranslations("developerWorkspace.dashboard");
  const tip = getTipOfTheDay();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      className={cn("dev-dash-card p-4", className)}
    >
      <div className="flex items-center gap-2 text-[var(--dev-dash-fg-muted)] mb-2">
        <Lightbulb className="h-4 w-4 text-[var(--dev-dash-accent-green)]" />
        <span className="text-xs font-medium uppercase tracking-wider">
          {t("tipsDev")}
        </span>
      </div>
      <p className="text-sm text-[var(--dev-dash-fg)] leading-relaxed">
        {tip}
      </p>
    </motion.section>
  );
}
