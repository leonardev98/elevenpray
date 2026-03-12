"use client";

import { useTranslations } from "next-intl";
import { ProjectCard } from "../components/ProjectCard";
import { MOCK_PROJECTS } from "@/app/lib/developer-workspace";

export default function ProjectsPage() {
  const t = useTranslations("developerWorkspace.sidebar");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("projects")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Active projects with quick links to docs, snippets, vault, notes, tasks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
