"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useWorkspaces } from "./workspaces-provider";
import { useTranslations } from "next-intl";

/**
 * Si el usuario no tiene workspaces, redirige a /onboarding.
 * No aplica en /workspace/developer/* (prompts, vault, snippets, notas, etc.).
 * Debe usarse dentro de WorkspacesProvider.
 */
export function RedirectToOnboardingOrRender({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspaces, isLoading } = useWorkspaces();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");

  const isDeveloperWorkspace = pathname?.startsWith?.("/workspace/developer") ?? false;

  useEffect(() => {
    if (isLoading || isDeveloperWorkspace) return;
    if (workspaces.length === 0) {
      router.replace("/onboarding");
    }
  }, [isLoading, isDeveloperWorkspace, workspaces.length, router]);

  if (isDeveloperWorkspace) {
    return <>{children}</>;
  }

  if (!isLoading && workspaces.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
