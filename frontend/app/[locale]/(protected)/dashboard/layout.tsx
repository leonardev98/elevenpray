"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { LocaleSwitcher } from "../../../components/locale-switcher";
import { WorkspacesProvider } from "./components/workspaces-provider";
import { DashboardSidebar } from "./components/dashboard-sidebar";

const navHrefs = [
  { href: "/dashboard" as const, key: "dashboard" as const },
  { href: "/dashboard/routines" as const, key: "routines" as const },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspacesDrawerOpen, setWorkspacesDrawerOpen] = useState(false);
  const t = useTranslations("nav");
  const tLanding = useTranslations("landing");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) router.replace("/");
  }, [isLoading, token, user, router]);

  useEffect(() => {
    setMobileNavOpen(false);
    setWorkspacesDrawerOpen(false);
  }, [pathname]);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  const isPlatformAdmin = (user.role ?? "user") === "platform_admin";

  return (
    <WorkspacesProvider token={token}>
      <div className="flex h-screen min-h-screen bg-[var(--app-bg)]">
        {/* Sidebar: contenedor con esquina redondeada para unificar con header */}
        <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col lg:rounded-r-2xl lg:overflow-hidden lg:shadow-sm">
          <DashboardSidebar
            navHrefs={navHrefs}
            pathname={pathname}
            t={t}
            isPlatformAdmin={isPlatformAdmin}
            workspacesDrawerOpen={workspacesDrawerOpen}
            onCloseWorkspacesDrawer={() => setWorkspacesDrawerOpen(false)}
            onOpenWorkspacesDrawer={() => setWorkspacesDrawerOpen(true)}
          />
        </div>

        {/* Overlay y drawer móvil */}
        {mobileNavOpen && (
          <>
            <div
              role="presentation"
              aria-hidden="true"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <div className="fixed left-0 top-0 z-50 lg:hidden">
              <DashboardSidebar
                navHrefs={navHrefs}
                pathname={pathname}
                t={t}
                isPlatformAdmin={isPlatformAdmin}
                workspacesDrawerOpen={false}
                onCloseWorkspacesDrawer={() => setMobileNavOpen(false)}
                onOpenWorkspacesDrawer={() => {}}
                isMobileDrawer
                onCloseMobile={() => setMobileNavOpen(false)}
              />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header: misma superficie que sidebar, borde inferior sutil */}
          <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 lg:rounded-bl-2xl lg:shadow-sm">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={tCommon("openMenu")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--app-fg)] hover:bg-[var(--app-bg)] lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-1 items-center justify-center">
              <label htmlFor="global-search" className="sr-only">
                Buscar
              </label>
              <input
                id="global-search"
                type="search"
                placeholder="Buscar…"
                className="w-full max-w-md rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setWorkspacesDrawerOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] lg:hidden"
                aria-label={t("workspaces")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <ThemeToggle />
              <LocaleSwitcher />
              {isPlatformAdmin && (
                <Link
                  href="/admin"
                  className="hidden rounded-xl bg-[var(--app-navy)]/15 px-3 py-2 text-sm font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/25 sm:inline-flex"
                >
                  Panel Admin
                </Link>
              )}
              <span className="hidden max-w-[120px] truncate text-sm text-[var(--app-fg)]/80 sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="rounded-xl border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                {t("logout")}
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--app-bg)] p-4 sm:p-6">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </WorkspacesProvider>
  );
}
