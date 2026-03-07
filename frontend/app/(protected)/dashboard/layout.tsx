"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../providers/auth-provider";
import { ThemeToggle } from "../../components/theme-toggle";
import { TopicsProvider } from "./components/topics-provider";
import { AsideTopics } from "./components/aside-topics";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) router.replace("/login");
  }, [isLoading, token, user, router]);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">Cargando…</p>
      </div>
    );
  }

  return (
    <TopicsProvider>
      <div className="flex h-screen min-h-screen flex-col bg-[var(--app-bg)]">
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-semibold tracking-tight text-[var(--app-fg)]"
            >
              ElevenPray
            </Link>
            <nav className="hidden gap-1 sm:flex">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
              >
                Inicio
              </Link>
              <Link
                href="/dashboard/routines"
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
              >
                Rutinas
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-[var(--app-fg)]/70">{user.name}</span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
            >
              Salir
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AsideTopics />
          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </TopicsProvider>
  );
}
