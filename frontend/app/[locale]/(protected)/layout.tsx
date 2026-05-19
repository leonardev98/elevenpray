"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../providers/auth-provider";
import { RedirectLegacyRoutes } from "./app/components/redirect-legacy-routes";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");

  const isAppShell = pathname?.startsWith("/app") ?? false;
  const isOnboarding = pathname?.startsWith("/onboarding") ?? false;
  const shouldRedirectToApp =
    !isLoading && !!token && !!user && !isAppShell && !isOnboarding;

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) router.replace("/");
  }, [isLoading, token, user, router]);

  useEffect(() => {
    if (shouldRedirectToApp) router.replace("/app");
  }, [shouldRedirectToApp, router]);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  if (isAppShell || isOnboarding) {
    return (
      <RedirectLegacyRoutes>
        <div className="flex h-screen min-h-screen flex-col bg-[var(--app-bg)]">{children}</div>
      </RedirectLegacyRoutes>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
      <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
    </div>
  );
}
