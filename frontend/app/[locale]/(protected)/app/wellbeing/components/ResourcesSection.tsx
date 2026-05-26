"use client";

import {
  BookHeart,
  BarChart2,
  Moon,
  Zap,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ResourceItem } from "../wellbeing-types";
import { RESOURCES } from "../wellbeing-mock-data";
import { SectionLabel } from "./SectionLabel";

const RESOURCE_ICONS: Record<ResourceItem["icon"], LucideIcon> = {
  BookHeart,
  BarChart2,
  Moon,
  Zap,
};

export function ResourcesSection() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <BookHeart className="h-5 w-5 text-[var(--app-primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
          Recursos de Bienestar
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RESOURCES.map((resource) => {
          const Icon = RESOURCE_ICONS[resource.icon];
          return (
            <button
              key={resource.id}
              type="button"
              className="group relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-gradient-to-br from-[var(--app-surface-elevated)] to-[var(--app-surface)] p-5 text-left transition-all duration-300 hover:border-[var(--app-primary)]/60 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--app-primary)]/10 transition-all duration-300 group-hover:scale-150" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)]/10 transition-all duration-300 group-hover:bg-[var(--app-primary)] group-hover:shadow-lg">
                  <Icon className="h-6 w-6 text-[var(--app-primary)] transition-colors duration-300 group-hover:text-[var(--app-bg)]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--app-fg)] transition-colors duration-300 group-hover:text-[var(--app-primary)]">{resource.title}</p>
                  <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{resource.readTime}</p>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-medium transition-all duration-200 hover:shadow-sm ${resource.tagColor}`}
                  >
                    {resource.tag}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--app-fg-muted)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--app-primary)]" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
