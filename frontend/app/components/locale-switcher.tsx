"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeNames: Record<string, string> = {
  es: "ES",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={pathname}
          locale={loc}
          className={`min-h-[36px] min-w-[36px] rounded-md px-2.5 text-sm font-medium transition flex items-center justify-center ${
            locale === loc
              ? "text-[var(--app-fg)] font-semibold"
              : "text-[var(--app-fg)]/50 hover:text-[var(--app-fg)]"
          }`}
        >
          {localeNames[loc]}
        </Link>
      ))}
    </div>
  );
}
