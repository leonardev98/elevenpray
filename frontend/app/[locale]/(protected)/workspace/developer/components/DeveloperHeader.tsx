"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { LocaleSwitcher } from "@/app/components/locale-switcher";
import { useFocusMode } from "../focus-mode-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Circle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTEXTUAL_PHRASES = [
  "header.contextualBuild",
  "header.contextualReady",
  "header.contextualDeep",
] as const;

interface DeveloperHeaderProps {
  onOpenCommandPalette?: () => void;
  onSearchFocus?: () => void;
  onOpenMobileNav?: () => void;
  /** Mostrar botón Foco/Descanso (solo en workspace programador). En skincare no se muestra. */
  showFocusBreak?: boolean;
}

export function DeveloperHeader({
  onOpenCommandPalette,
  onSearchFocus,
  onOpenMobileNav,
  showFocusBreak = true,
}: DeveloperHeaderProps) {
  const t = useTranslations("developerWorkspace");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isFocusMode, setFocusMode } = useFocusMode();
  const [time, setTime] = useState(() => new Date());
  const [contextualIndex, setContextualIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setContextualIndex((i) => (i + 1) % CONTEXTUAL_PHRASES.length),
      8000
    );
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  const dateStr = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const initials = user?.name
    ?.split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--dev-border-subtle)] bg-[var(--dev-surface-overlay)] px-4 backdrop-blur-sm sm:gap-6 sm:px-6">
      {onOpenMobileNav && (
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-fg)]/60 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] lg:hidden"
          aria-label={tCommon("openMenu")}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {/* Left: time + date + contextual — bloque coherente */}
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
        <div className="flex flex-col">
          <span
            className="text-xl font-medium tabular-nums text-[var(--app-fg)] sm:text-2xl tracking-normal"
            style={{ letterSpacing: "var(--dev-font-display-tracking)" }}
          >
            {timeStr}
          </span>
          <span
            className="text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
            style={{ opacity: "var(--dev-font-meta-opacity)" }}
          >
            {dateStr}
          </span>
        </div>
        <span
          className="hidden text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] sm:inline"
          style={{ opacity: 0.7 }}
        >
          {t(CONTEXTUAL_PHRASES[contextualIndex])}
        </span>
      </div>

      {/* Right: focus (solo programador), theme, language, avatar */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {showFocusBreak && (
          <button
            type="button"
            onClick={() => setFocusMode(!isFocusMode)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-[length:var(--dev-font-meta-size)] font-medium transition-colors",
              isFocusMode
                ? "bg-[var(--app-navy)]/12 text-[var(--app-navy)]"
                : "bg-[var(--app-bg)] text-[var(--app-fg)]/60 hover:text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)]"
            )}
            aria-label={isFocusMode ? t("header.focus") : t("header.break")}
            title={isFocusMode ? t("header.focus") : t("header.break")}
          >
            <Circle
              className={cn("h-2 w-2 shrink-0 fill-current", isFocusMode && "text-emerald-500")}
            />
            <span className="hidden sm:inline">
              {isFocusMode ? t("header.focus") : t("header.break")}
            </span>
          </button>
        )}
        <ThemeToggle />
        <LocaleSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-navy)]/12 text-[length:var(--dev-font-body-size)] font-medium text-[var(--app-navy)] transition-colors hover:bg-[var(--app-navy)]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/40"
            title={user?.name ?? undefined}
            aria-label={tCommon("openMenu")}
          >
            {initials}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push("/workspace/developer/settings")}
              className="cursor-pointer"
            >
              {tNav("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="cursor-pointer"
            >
              {tNav("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
