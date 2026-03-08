"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";
import { ThemeToggle } from "../../../components/theme-toggle";
import { LocaleSwitcher } from "../../../components/locale-switcher";
import { WorkspacesProvider } from "./components/workspaces-provider";
import { AsideTopics } from "./components/aside-topics";

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
    if (!token || !user) router.replace("/login");
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

  return (
    <WorkspacesProvider token={token}>
      <div className="flex h-screen min-h-screen flex-col bg-[var(--app-bg)]">
        <header className="flex h-14 flex-shrink-0 items-center justify-between gap-2 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-6">
            <Link
              href="/dashboard"
              className="shrink-0 text-base font-semibold tracking-tight text-[var(--app-fg)] sm:text-lg"
            >
              {tLanding("title")}
            </Link>
            <nav className="hidden gap-1 md:flex">
              {navHrefs.map(({ href, key }) => {
                const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition min-h-[44px] flex items-center ${
                      isActive
                        ? "bg-[var(--app-bg)] text-[var(--app-fg)] font-semibold"
                        : "text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
                    }`}
                  >
                    {t(key)}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label={tCommon("openMenu")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--app-fg)] hover:bg-[var(--app-bg)] md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setWorkspacesDrawerOpen(true)}
              className="flex h-10 min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)] lg:hidden"
              aria-label={t("openWorkspaces")}
            >
              {t("workspaces")}
            </button>
            <LocaleSwitcher />
            <ThemeToggle />
            <span className="hidden text-sm text-[var(--app-fg)]/70 sm:inline md:max-w-[120px] md:truncate">
              {user.name}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)] min-h-[44px]"
            >
              {t("logout")}
            </button>
          </div>
        </header>

        {/* Drawer menú móvil */}
        {mobileNavOpen && (
          <>
            <div
              role="presentation"
              aria-hidden="true"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <aside
              aria-modal="true"
              aria-label={t("navigation")}
              className="fixed left-0 top-0 z-50 flex h-full w-full max-w-[260px] flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--app-fg)]">{tCommon("menu")}</span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label={tCommon("closeMenu")}
                  className="rounded-lg p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)]"
                >
                  ×
                </button>
              </div>
              <nav className="flex flex-col p-2">
                {navHrefs.map(({ href, key }) => {
                  const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`rounded-lg px-4 py-3 text-sm font-medium transition min-h-[48px] flex items-center ${
                        isActive ? "bg-[var(--app-bg)] text-[var(--app-fg)] font-semibold" : "text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)]"
                      }`}
                    >
                      {t(key)}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        <div className="flex flex-1 overflow-hidden">
          <AsideTopics
            drawerOpen={workspacesDrawerOpen}
            onCloseDrawer={() => setWorkspacesDrawerOpen(false)}
          />
          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </WorkspacesProvider>
  );
}
