"use client";

import { useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "../../../providers/auth-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const isAdminRoot =
    pathname === "/admin" ||
    pathname?.endsWith("/admin") ||
    pathname?.match(/\/admin\/?$/);

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) {
      router.replace("/login?next=/admin");
      return;
    }
    if ((user.role ?? "user") !== "platform_admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, token, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">Cargando…</p>
      </div>
    );
  }

  if (!token || !user || (user.role ?? "user") !== "platform_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">Redirigiendo…</p>
      </div>
    );
  }

  return (
    <div className="admin-panel flex h-screen min-h-screen flex-col bg-[var(--app-bg)]">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-navy)] px-4 text-[var(--app-white)] shadow-lg shadow-black/10">
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="font-semibold tracking-normal text-[var(--app-white)]"
          >
            Panel Admin
          </Link>
          <nav className="hidden gap-1 md:flex">
            <Link
              href="/admin"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isAdminRoot
                  ? "bg-[var(--app-navy)]/20 text-[var(--app-navy)]"
                  : "text-[var(--app-white)]/80 hover:bg-white/10 hover:text-[var(--app-white)]"
              }`}
            >
              Categorías
            </Link>
            <Link
              href="/admin/usuarios"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname?.includes("/admin/usuarios")
                  ? "bg-[var(--app-navy)]/20 text-[var(--app-navy)]"
                  : "text-[var(--app-white)]/80 hover:bg-white/10 hover:text-[var(--app-white)]"
              }`}
            >
              Usuarios del panel
            </Link>
            <Link
              href="/admin/learning"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                pathname?.includes("/admin/learning")
                  ? "bg-[var(--app-navy)]/20 text-[var(--app-navy)]"
                  : "text-[var(--app-white)]/80 hover:bg-white/10 hover:text-[var(--app-white)]"
              }`}
            >
              Contenido educativo
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-[var(--app-white)]/80 sm:inline">
            {user.name}
          </span>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[var(--app-navy)]/50 px-3 py-2 text-sm text-[var(--app-navy)] hover:bg-[var(--app-navy)]/10"
          >
            Ir a la app
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
