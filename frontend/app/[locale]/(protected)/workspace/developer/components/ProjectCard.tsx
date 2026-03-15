"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { FolderOpen, StickyNote, MessageSquare, Code2, Lock, CheckSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/app/lib/developer-workspace/types";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const QUICK_ACTIONS_KEYS = [
  { icon: FolderOpen, key: "open", href: "/workspace/developer/projects" },
  { icon: StickyNote, key: "addNote", href: "/workspace/developer/notes" },
  { icon: MessageSquare, key: "runPrompt", href: "/workspace/developer" },
] as const;

const QUICK_LINKS = [
  { icon: FileText, label: "Docs", href: "#" },
  { icon: Code2, label: "Snippets", href: "/workspace/developer/snippets" },
  { icon: MessageSquare, label: "Prompts", href: "/workspace/developer/prompts" },
  { icon: Lock, label: "Vault", href: "/workspace/developer/vault" },
  { icon: StickyNote, label: "Notes", href: "/workspace/developer/notes" },
  { icon: CheckSquare, label: "Tasks", href: "/workspace/developer/tasks" },
];

function StatusBadge({ status, badge }: { status: string; badge?: string }) {
  const isActive = status === "active";
  const badgeLower = badge?.toLowerCase() ?? "";
  const isProduction = badgeLower === "production";
  const isWip = badgeLower === "wip";
  const isStaging = badgeLower === "staging";
  const isInternal = badgeLower === "internal";

  if (badge) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)]",
          isProduction && "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
          isWip && "bg-amber-500/12 text-amber-700 dark:text-amber-400",
          isStaging && "bg-blue-500/12 text-blue-700 dark:text-blue-400",
          isInternal && "bg-[var(--app-fg)]/10 text-[var(--app-fg)]/70",
          !isProduction && !isWip && !isStaging && !isInternal && "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
        )}
      >
        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
        {badge}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[length:var(--dev-font-label-size)] font-medium",
        isActive ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-[var(--app-fg)]/10 text-[var(--app-fg)]/60"
      )}
    >
      {status}
    </span>
  );
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const date = new Date(project.lastAccessed);
  const lastAccessedStr = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const primaryBadge = project.badges?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        "rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 transition-all duration-200",
        "shadow-[var(--dev-shadow-card)] hover:shadow-[var(--dev-shadow-hover)] hover:border-[var(--app-border)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href="/workspace/developer/projects"
            className="block text-[length:var(--dev-font-body-size)] font-semibold text-[var(--app-fg)] transition-colors hover:text-[var(--app-navy)]"
          >
            {project.name}
          </Link>
          <p
            className="mt-1 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
            style={{ opacity: "var(--dev-font-meta-opacity)" }}
          >
            {project.stack.join(" · ")}
          </p>
          <p
            className="mt-0.5 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
            style={{ opacity: 0.5 }}
          >
            Last: {lastAccessedStr}
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
          {project.badges?.map((b) => (
            <StatusBadge key={b} status={project.status} badge={b} />
          ))}
          {(!project.badges || project.badges.length === 0) && (
            <StatusBadge status={project.status} />
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--dev-border-subtle)] pt-3">
        {QUICK_ACTIONS_KEYS.map(({ icon: Icon, key: actionKey, href }) => (
          <Link
            key={actionKey}
            href={href}
            title={t(actionKey)}
            className="flex items-center gap-1.5 rounded-md border border-[var(--dev-border-subtle)] bg-[var(--app-navy)]/10 px-2 py-1.5 text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] transition-colors hover:bg-[var(--app-navy)]/15"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only sm:not-sr-only sm:inline">{t(actionKey)}</span>
          </Link>
        ))}
        {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            title={label}
            className="flex items-center gap-1.5 rounded-md border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-2 py-1.5 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]/70 transition-colors hover:bg-[var(--app-navy)]/5 hover:text-[var(--app-navy)]"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
          </Link>
        ))}
      </div>
    </motion.article>
  );
}
