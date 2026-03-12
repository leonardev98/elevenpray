"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import {
  LayoutDashboard,
  Lock,
  MessageSquare,
  Code2,
  FolderKanban,
  CheckSquare,
  Wrench,
  Sparkles,
  Rss,
  StickyNote,
  User,
  Settings,
  Plus,
  Copy,
} from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { usePrompts, recordPromptUse } from "@/app/lib/developer-workspace";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const t = useTranslations("developerWorkspace");
  const { token } = useAuth();
  const { data: recentPrompts } = usePrompts(
    open && token ? token : null,
    { recent: true, sortBy: "last_used_at", sortOrder: "desc" }
  );
  const recentList = recentPrompts?.slice(0, 5) ?? [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const handleRecentPromptSelect = async (id: string, content: string) => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(content);
      await recordPromptUse(token, id);
    } catch {
      // ignore
    }
    run(() => router.push("/workspace/developer/prompts"));
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      label={t("commandPalette.placeholder")}
      overlayClassName="bg-black/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      contentClassName="rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] shadow-[var(--dev-shadow-hover)] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
    >
      <CommandInput
        placeholder={t("commandPalette.placeholder")}
        className="flex h-12 w-full border-0 border-b border-[var(--dev-border-subtle)] bg-transparent px-4 text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:ring-0 focus:ring-offset-0"
      />
      <CommandList className="max-h-[min(60vh,400px)] overflow-y-auto p-2">
        <CommandEmpty className="py-6 text-center text-[length:var(--dev-font-body-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
          No hay resultados.
        </CommandEmpty>
        {recentList.length > 0 && (
          <CommandGroup heading={t("commandPalette.recentPrompts")} value="recent-prompts">
            {recentList.map((p) => (
              <CommandItem
                key={p.id}
                value={`prompt-${p.id}-${p.title}`}
                onSelect={() => handleRecentPromptSelect(p.id, p.content)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
              >
                <Copy className="h-4 w-4 shrink-0" />
                <span className="truncate">{p.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading={t("commandPalette.navigation")} value="nav">
          <CommandItem
            value="dashboard"
            onSelect={() => run(() => router.push("/workspace/developer"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t("sidebar.dashboard")}</span>
          </CommandItem>
          <CommandItem
            value="vault"
            onSelect={() => run(() => router.push("/workspace/developer/vault"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Lock className="h-4 w-4" />
            <span>{t("sidebar.vault")}</span>
          </CommandItem>
          <CommandItem
            value="prompts"
            onSelect={() => run(() => router.push("/workspace/developer/prompts"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t("sidebar.prompts")}</span>
          </CommandItem>
          <CommandItem
            value="snippets"
            onSelect={() => run(() => router.push("/workspace/developer/snippets"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Code2 className="h-4 w-4" />
            <span>{t("sidebar.snippets")}</span>
          </CommandItem>
          <CommandItem
            value="projects"
            onSelect={() => run(() => router.push("/workspace/developer/projects"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <FolderKanban className="h-4 w-4" />
            <span>{t("sidebar.projects")}</span>
          </CommandItem>
          <CommandItem
            value="tasks"
            onSelect={() => run(() => router.push("/workspace/developer/tasks"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <CheckSquare className="h-4 w-4" />
            <span>{t("sidebar.tasks")}</span>
          </CommandItem>
          <CommandItem
            value="tools"
            onSelect={() => run(() => router.push("/workspace/developer/tools"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Wrench className="h-4 w-4" />
            <span>{t("sidebar.tools")}</span>
          </CommandItem>
          <CommandItem
            value="ai actions"
            onSelect={() => run(() => router.push("/workspace/developer/ai-actions"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("sidebar.aiActions")}</span>
          </CommandItem>
          <CommandItem
            value="tech feed"
            onSelect={() => run(() => router.push("/workspace/developer/tech-feed"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Rss className="h-4 w-4" />
            <span>{t("sidebar.techFeed")}</span>
          </CommandItem>
          <CommandItem
            value="notes"
            onSelect={() => run(() => router.push("/workspace/developer/notes"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <StickyNote className="h-4 w-4" />
            <span>{t("sidebar.notes")}</span>
          </CommandItem>
          <CommandItem
            value="profile"
            onSelect={() => run(() => router.push("/workspace/developer/profile"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <User className="h-4 w-4" />
            <span>{t("sidebar.profile")}</span>
          </CommandItem>
          <CommandItem
            value="settings"
            onSelect={() => run(() => router.push("/workspace/developer/settings"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Settings className="h-4 w-4" />
            <span>{t("sidebar.settings")}</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t("commandPalette.actions")} value="actions">
          <CommandItem
            value="new note"
            onSelect={() => run(() => router.push("/workspace/developer/notes"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Plus className="h-4 w-4" />
            <span>{t("dashboard.newNote")}</span>
          </CommandItem>
          <CommandItem
            value="create task"
            onSelect={() => run(() => router.push("/workspace/developer/tasks"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Plus className="h-4 w-4" />
            <span>{t("dashboard.createTask")}</span>
          </CommandItem>
          <CommandItem
            value="open vault"
            onSelect={() => run(() => router.push("/workspace/developer/vault"))}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 aria-selected:bg-[var(--app-navy)]/10 aria-selected:text-[var(--app-navy)]"
          >
            <Lock className="h-4 w-4" />
            <span>{t("dashboard.openVault")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
