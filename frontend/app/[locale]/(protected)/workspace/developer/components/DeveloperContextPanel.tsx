"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Rss, FolderKanban } from "lucide-react";
import { MOCK_PROJECTS } from "@/app/lib/developer-workspace";
import { MOCK_TECH_FEED } from "@/app/lib/developer-workspace";

export function DeveloperContextPanel() {
  const t = useTranslations("developerWorkspace.dashboard");
  const recentProjects = MOCK_PROJECTS.filter((p) => p.status === "active")
    .slice(0, 3);
  const feedItems = MOCK_TECH_FEED.slice(0, 4);

  return (
    <aside className="hidden w-72 flex-shrink-0 xl:block">
      <div className="sticky top-6 space-y-6">
        {/* Actividad reciente */}
        <section className="rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]">
          <h3 className="flex items-center gap-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/70">
            <FolderKanban className="h-3.5 w-3.5" />
            Proyectos recientes
          </h3>
          <ul className="mt-3 space-y-1.5">
            {recentProjects.length === 0 ? (
              <li>
                <p className="text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
                  Sin actividad reciente
                </p>
                <Link
                  href="/workspace/developer/projects"
                  className="mt-1 inline-block text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] hover:underline"
                >
                  Abrir proyectos
                </Link>
              </li>
            ) : (
              recentProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href="/workspace/developer/projects"
                    className="block truncate text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] transition-colors hover:text-[var(--app-navy)]"
                  >
                    {p.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Tech feed resumido */}
        <section className="rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]">
          <h3 className="flex items-center gap-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/70">
            <Rss className="h-3.5 w-3.5" />
            Tech feed
          </h3>
          <ul className="mt-3 space-y-2">
            {feedItems.map((item) => (
              <li key={item.id}>
                <Link
                  href="/workspace/developer/tech-feed"
                  className="block text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)] transition-colors hover:text-[var(--app-navy)]"
                  style={{ opacity: 0.9 }}
                >
                  <span className="line-clamp-2">{item.title}</span>
                  <span className="mt-0.5 block text-[length:var(--dev-font-label-size)] text-[var(--app-fg)]" style={{ opacity: 0.6 }}>
                    {item.source} · {item.time}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/workspace/developer/tech-feed"
            className="mt-3 block text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] hover:underline"
          >
            Ver todo →
          </Link>
        </section>
      </div>
    </aside>
  );
}
