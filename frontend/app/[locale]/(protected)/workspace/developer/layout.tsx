"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { DeveloperHeader } from "./components/DeveloperHeader";
import { DeveloperNavHorizontal } from "./components/DeveloperNavHorizontal";
import { CommandPalette } from "./components/CommandPalette";
import { useSidebar } from "../../sidebar-context";

export default function DeveloperWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const t = useTranslations("common");
  const sidebar = useSidebar();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <DeveloperHeader
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileNav={() => sidebar?.openMobileNav()}
        />
        <DeveloperNavHorizontal />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)] p-4 sm:p-6">
          <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
