"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  StickyNote,
  Lock,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Timer,
} from "lucide-react";
import { useFocusMode } from "./focus-mode-context";
import { FocusCard } from "./components/FocusCard";
import { ProjectCard } from "./components/ProjectCard";
import { QuickNotesCard } from "./components/QuickNotesCard";
import { FocusTimer } from "./components/FocusTimer";
import { TodaySnapshot } from "./components/TodaySnapshot";
import { DeveloperContextPanel } from "./components/DeveloperContextPanel";
import { MOCK_PROJECTS, MOCK_TASKS } from "@/app/lib/developer-workspace";

const QUICK_ACTIONS = [
  { key: "newNote", href: "/workspace/developer/notes", icon: StickyNote },
  { key: "openVault", href: "/workspace/developer/vault", icon: Lock },
  { key: "addPrompt", href: "/workspace/developer/prompts", icon: MessageSquare },
  { key: "openProject", href: "/workspace/developer/projects", icon: FolderKanban },
  { key: "createTask", href: "/workspace/developer/tasks", icon: CheckSquare },
  { key: "startFocus", href: "#focus-timer", icon: Timer },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DeveloperWorkspaceDashboardPage() {
  const locale = useLocale();
  const t = useTranslations("developerWorkspace.dashboard");
  const { isFocusMode } = useFocusMode();
  const [time] = useState(() => new Date());
  const localeTag = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : locale;
  const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
  const dateStr = time.toLocaleDateString(localeTag, { weekday: "long", month: "long", day: "numeric" });
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === "active").slice(0, 4);
  const tasksTodayCount = MOCK_TASKS.filter((x) => x.dueToday && x.status !== "done").length;

  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1 space-y-10">
      {/* Hero — composición editorial, hora integrada, quick actions premium */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-6 shadow-[var(--dev-shadow-card)] sm:p-7"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-fg)]"
              style={{ opacity: "var(--dev-font-meta-opacity)" }}
            >
              {getGreeting()}
            </p>
            <h1
              className="mt-1 text-[length:var(--dev-font-display-size)] font-normal tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)] sm:text-2xl"
            >
              {t("heroTitle")}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-medium tabular-nums text-[var(--app-navy)] sm:text-3xl tracking-normal">
                {timeStr}
              </span>
              <span
                className="text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
                style={{ opacity: "var(--dev-font-meta-opacity)" }}
              >
                {dateStr}
              </span>
            </div>
          </div>
          {tasksTodayCount > 0 && (
            <p className="text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
              {tasksTodayCount} {tasksTodayCount === 1 ? "tarea" : "tareas"} hoy
            </p>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--dev-border-subtle)] pt-5">
          {QUICK_ACTIONS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/60 px-3 py-2 text-[length:var(--dev-font-body-size)] font-medium text-[var(--app-fg)] transition-colors hover:border-[var(--app-navy)]/20 hover:bg-[var(--app-navy)]/5 hover:text-[var(--app-navy)]"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key)}
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Daily Focus */}
      <FocusCard />

      {/* Active Projects */}
      <section>
        <h2 className="mb-4 text-[length:var(--dev-font-display-size)] font-medium tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)]">
          {t("activeProjects")}
        </h2>
        {activeProjects.length === 0 ? (
          <div className="rounded-xl border border-[var(--dev-border-subtle)] border-dashed bg-[var(--app-bg)]/50 p-8 text-center">
            <p className="text-[length:var(--dev-font-body-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
              No hay proyectos activos
            </p>
            <Link
              href="/workspace/developer/projects"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--app-navy)] px-4 py-2.5 text-sm font-medium text-[var(--app-white)] transition-opacity hover:opacity-95"
            >
              Abrir proyectos
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Two columns: Quick Notes + Focus Timer, then Snapshot */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickNotesCard />
        <div id="focus-timer">
          <FocusTimer />
        </div>
      </div>

      <TodaySnapshot />
      </div>
      {!isFocusMode && <DeveloperContextPanel />}
    </div>
  );
}
