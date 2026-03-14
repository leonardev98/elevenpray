"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Plus, Camera, FileText, Settings } from "lucide-react";

interface QuickActionsCardProps {
  workspaceId: string;
}

const ACTIONS: {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  disabled?: boolean;
}[] = [
  { href: "products", labelKey: "quickActionAddProduct", icon: Plus },
  { href: "photos", labelKey: "quickActionRegisterPhoto", icon: Camera, disabled: true },
  { href: "journal", labelKey: "quickActionWriteJournal", icon: FileText, disabled: true },
  { href: "routine", labelKey: "quickActionEditRoutine", icon: Settings },
];

const linkClass =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-bg)] hover:text-[var(--app-navy)] dark:hover:bg-zinc-800 dark:hover:text-sky-400";
const disabledClass =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--app-fg)]/45 cursor-not-allowed select-none dark:text-zinc-500";

export function QuickActionsCard({ workspaceId }: QuickActionsCardProps) {
  const t = useTranslations("workspaceNav");
  const tConstruction = useTranslations("underConstruction");
  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
      aria-labelledby="quick-actions-heading"
    >
      <h2
        id="quick-actions-heading"
        className="mb-3 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        {t("quickActions")}
      </h2>
      <ul className="space-y-1.5">
        {ACTIONS.map(({ href, labelKey, icon: Icon, disabled }) => (
          <li key={href}>
            {disabled ? (
              <span
                className={disabledClass}
                aria-disabled="true"
                title={tConstruction("title")}
              >
                <Icon className="h-4 w-4 flex-shrink-0 opacity-60" aria-hidden />
                {t(labelKey)}
              </span>
            ) : (
              <Link href={`${base}/${href}`} className={linkClass}>
                <Icon className="h-4 w-4 flex-shrink-0 text-[var(--app-fg)]/70" aria-hidden />
                {t(labelKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
