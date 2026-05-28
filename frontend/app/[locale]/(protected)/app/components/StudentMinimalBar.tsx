"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStudentShell } from "./student-shell-context";
import { UserMenuButton } from "./UserMenuButton";
import { PomodoroNavControl } from "../pomodoro/components/PomodoroNavControl";

interface StudentMinimalBarProps {
  title?: string;
}

/** Barra superior fija con pomodoro y menú cuando la página oculta el saludo completo. */
export function StudentMinimalBar({ title }: StudentMinimalBarProps) {
  const shell = useStudentShell();
  const t = useTranslations("studentHome");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]/90 px-4 py-3 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {shell.openMobileMenu ? (
          <button
            type="button"
            onClick={shell.openMobileMenu}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        {title ? (
          <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            {title}
          </h1>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PomodoroNavControl compact />
        <UserMenuButton />
      </div>
    </header>
  );
}
