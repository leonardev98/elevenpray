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
      <SectionLabel>RECURSOS DE BIENESTAR</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RESOURCES.map((resource) => {
          const Icon = RESOURCE_ICONS[resource.icon];
          return (
            <button
              key={resource.id}
              type="button"
              className="student-card group flex w-full items-start gap-4 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-primary)]/40"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--app-primary)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--app-fg)]">{resource.title}</p>
                <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{resource.readTime}</p>
                <span
                  className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${resource.tagColor}`}
                >
                  {resource.tag}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--app-fg-muted)] transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
