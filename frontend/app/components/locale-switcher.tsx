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

const localeNames: Record<string, string> = {
  es: "Español",
  en: "English",
};

const localeShort: Record<string, string> = {
  es: "ES",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 min-w-[72px] items-center justify-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30"
        )}
        aria-label="Cambiar idioma"
      >
        <span>{localeShort[locale] ?? locale.toUpperCase()}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-[140px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-lg"
      >
        {routing.locales.map((loc) => (
          <DropdownMenuItem key={loc}>
            <Link
              href={pathname}
              locale={loc}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium outline-none",
                "text-[var(--app-fg)] hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)]",
                locale === loc && "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
              )}
            >
              {localeNames[loc]}
              {locale === loc ? " ✓" : null}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
