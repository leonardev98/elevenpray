"use client";

import { useTranslations } from "next-intl";
import { User } from "lucide-react";
import { MOCK_PROFILE } from "@/app/lib/developer-workspace";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const t = useTranslations("developerWorkspace.profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Your technical profile — used to personalize feed, prompts, and recommendations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {MOCK_PROFILE.map((category) => (
          <section
            key={category.id}
            className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--app-fg)]">
              <User className="h-5 w-5 text-[var(--app-navy)]" />
              {category.name}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/50 px-3 py-2 text-sm font-medium text-[var(--app-fg)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
