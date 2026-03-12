"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  CheckSquare,
  MessageSquare,
  Code2,
  Lock,
  FolderKanban,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MOCK_TASKS,
  MOCK_PROMPTS,
  MOCK_SNIPPETS,
  MOCK_VAULT_ITEMS,
  MOCK_PROJECTS,
} from "@/app/lib/developer-workspace";

interface TodaySnapshotProps {
  className?: string;
}

const ITEMS = [
  {
    key: "tasks",
    icon: CheckSquare,
    count: MOCK_TASKS.filter((t) => t.status !== "done").length,
    href: "/workspace/developer/tasks",
  },
  {
    key: "prompts",
    icon: MessageSquare,
    count: MOCK_PROMPTS.length,
    href: "/workspace/developer/prompts",
  },
  {
    key: "snippets",
    icon: Code2,
    count: MOCK_SNIPPETS.length,
    href: "/workspace/developer/snippets",
  },
  {
    key: "vault",
    icon: Lock,
    count: MOCK_VAULT_ITEMS.length,
    href: "/workspace/developer/vault",
  },
  {
    key: "projects",
    icon: FolderKanban,
    count: MOCK_PROJECTS.filter((p) => p.status === "active").length,
    href: "/workspace/developer/projects",
  },
];

export function TodaySnapshot({ className }: TodaySnapshotProps) {
  const t = useTranslations("developerWorkspace.dashboard");

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-6 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="text-[length:var(--dev-font-display-size)] font-medium tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)]">
        {t("todaySnapshot")}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ITEMS.map(({ key, icon: Icon, count, href }) => (
          <Link
            key={key}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 p-3 transition-all duration-150 hover:border-[var(--app-navy)]/15 hover:bg-[var(--app-navy)]/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10">
              <Icon className="h-5 w-5 text-[var(--app-navy)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[length:var(--dev-font-body-size)] font-semibold text-[var(--app-fg)]">{count}</p>
              <p className="text-[length:var(--dev-font-meta-size)] capitalize text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>{key}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
