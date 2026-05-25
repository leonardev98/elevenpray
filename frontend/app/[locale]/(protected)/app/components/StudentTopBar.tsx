"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { getStudentProfile } from "../lib/student-storage";
import { useEffect, useState } from "react";
import { useStudentShell } from "./student-shell-context";

interface StudentTopBarProps {
  onOpenMenu?: () => void;
  title?: string;
}

export function StudentTopBar({ onOpenMenu, title }: StudentTopBarProps) {
  const shell = useStudentShell();
  const openMenu = onOpenMenu ?? shell.openMobileMenu;
  const { user } = useAuth();
  const t = useTranslations("studentHome");
  const locale = useLocale() as "es" | "en";
  const dateFnsLocale = locale === "en" ? enUS : es;
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const p = getStudentProfile();
    setProfileName(p?.name ?? null);
  }, []);

  const displayName = profileName || user?.name?.split(" ")[0] || t("guest");
  const today = format(new Date(), "EEEE, d MMMM", { locale: dateFnsLocale });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--app-border)] bg-[var(--app-bg)]/90 px-4 py-4 backdrop-blur-md lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {openMenu && (
          <button
            type="button"
            onClick={openMenu}
            className="rounded-xl p-2 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface)] lg:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate text-lg font-semibold text-[var(--app-fg)]">{title}</h1>
          ) : (
            <>
              <p className="text-sm text-[var(--app-fg-secondary)] capitalize">{today}</p>
              <h1 className="truncate text-xl font-semibold text-[var(--app-fg)]">
                {t("greeting", { name: displayName })}
              </h1>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
