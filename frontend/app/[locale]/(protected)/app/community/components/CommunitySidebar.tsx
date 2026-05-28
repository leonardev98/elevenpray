"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { listTopContributors } from "@/app/lib/community-templates-api";
import { SectionLabel } from "../../wellbeing/components/SectionLabel";
import type {
  CommunityFilters,
  TemplateCareer,
  TemplateType,
  TopContributorDto,
} from "../community-types";
import {
  TEMPLATE_CAREERS,
  TEMPLATE_TYPE_FILTERS,
  getAuthorColor,
} from "../community-constants";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

interface CommunitySidebarProps {
  filters: CommunityFilters;
  onFiltersChange: (patch: Partial<CommunityFilters>) => void;
}

export function CommunitySidebar({
  filters,
  onFiltersChange,
}: CommunitySidebarProps) {
  const t = useTranslations("studentCommunity");
  const { token } = useAuth();
  const [contributors, setContributors] = useState<TopContributorDto[]>([]);

  useEffect(() => {
    if (!token) return;
    listTopContributors(token)
      .then(setContributors)
      .catch(() => setContributors([]));
  }, [token]);

  function toggleType(type: TemplateType) {
    const has = filters.types.includes(type);
    onFiltersChange({
      types: has
        ? filters.types.filter((x) => x !== type)
        : [...filters.types, type],
    });
  }

  return (
    <aside className="space-y-6">
      <section>
        <SectionLabel>{t("filterCareer").toUpperCase()}</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPLATE_CAREERS.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                onFiltersChange({ career: id as TemplateCareer | "todas" })
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.career === id
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>{t("filterType").toUpperCase()}</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPLATE_TYPE_FILTERS.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleType(id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.types.includes(id)
                  ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "border border-[var(--app-border)] text-[var(--app-fg-muted)] hover:border-[var(--app-primary)]",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </section>

      <section className="student-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--app-fg)]">
              {t("universityFirst")}
            </p>
            <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">
              {t("universityFirstHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={filters.universityFirst}
            onClick={() =>
              onFiltersChange({ universityFirst: !filters.universityFirst })
            }
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              filters.universityFirst
                ? "bg-[var(--accent)]"
                : "bg-[var(--bg-input)]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                filters.universityFirst ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>
      </section>

      <section>
        <SectionLabel>{t("topContributors").toUpperCase()}</SectionLabel>
        <ul className="mt-3 space-y-2">
          {contributors.length === 0 ? (
            <li className="student-card p-3 text-xs text-[var(--app-fg-muted)]">
              —
            </li>
          ) : (
            contributors.map((user, index) => (
              <li
                key={user.id}
                className="student-card flex items-center gap-3 p-3"
              >
                <UserAvatar
                  initial={user.initial}
                  colorClass={getAuthorColor(user.name)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--app-fg)]">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--app-fg-muted)]">
                    {user.university ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {index === 0 && (
                    <Award
                      className="h-4 w-4 text-[var(--xp)]"
                      aria-label="Primer lugar"
                    />
                  )}
                  <span className="rounded-[var(--radius-sm)] bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                    {t("contributions", { count: user.contributions })}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </aside>
  );
}
