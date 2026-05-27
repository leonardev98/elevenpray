"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobileNavClose } from "@/components/ui/floating-navbar";

const localeNames: Record<string, string> = {
  es: "Español",
  en: "English",
};

const localeShort: Record<string, string> = {
  es: "ES",
  en: "EN",
};

type LocaleSwitcherProps = {
  /** En menú móvil: botones en línea sin dropdown (evita conflictos de capas). */
  variant?: "dropdown" | "segmented";
};

export function LocaleSwitcher({ variant = "dropdown" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const closeMobileNav = useMobileNavClose();

  if (variant === "segmented") {
    return (
      <div
        className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-1"
        role="group"
        aria-label="Cambiar idioma"
      >
        {routing.locales.map((loc) => (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            onClick={() => closeMobileNav?.()}
            className={cn(
              "flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
              locale === loc
                ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-body)] hover:bg-[var(--accent-subtle)] hover:text-[var(--text-primary)]"
            )}
          >
            {localeShort[loc]}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 min-w-[72px] items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
        )}
        aria-label="Cambiar idioma"
      >
        <span>{localeShort[locale] ?? locale.toUpperCase()}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[6200] min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] py-1 shadow-[var(--shadow-md)]"
      >
        {routing.locales.map((loc) => (
          <DropdownMenuItem key={loc} className="p-0 focus:bg-transparent">
            <Link
              href={pathname}
              locale={loc}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors",
                "text-[var(--text-primary)] hover:bg-[var(--accent-subtle)]",
                locale === loc && "bg-[var(--accent-subtle)] text-[var(--accent)]"
              )}
            >
              {localeNames[loc]}
              {locale === loc ? (
                <span className="ml-auto text-xs text-[var(--accent)]" aria-hidden>
                  ✓
                </span>
              ) : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
