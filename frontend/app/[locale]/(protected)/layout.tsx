"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "@/i18n/navigation";
import Lenis from "lenis";
import { pageTransition } from "@/lib/animations";
import "lenis/dist/lenis.css";
import { useAuth } from "../../providers/auth-provider";
import { WorkspacesProvider } from "./dashboard/components/workspaces-provider";
import { RedirectToOnboardingOrRender } from "./dashboard/components/redirect-to-onboarding";
import { DashboardSidebar } from "./dashboard/components/dashboard-sidebar";
import { SidebarProvider } from "./sidebar-context";

const navHrefs = [
  { href: "/dashboard" as const, key: "dashboard" as const },
  { href: "/dashboard/routines" as const, key: "routines" as const },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspacesDrawerOpen, setWorkspacesDrawerOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) router.replace("/");
  }, [isLoading, token, user, router]);

  useEffect(() => {
    setMobileNavOpen(false);
    setWorkspacesDrawerOpen(false);
  }, [pathname]);

  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const isScrollContainerMounted = !isLoading && !!token && !!user;

  // Lenis: scroll suave en todo el dashboard (se inicializa cuando el contenedor de scroll está montado)
  useEffect(() => {
    if (!isScrollContainerMounted) return;
    const wrapper = scrollWrapperRef.current;
    const content = scrollContentRef.current;
    if (!wrapper || !content) return;
    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      syncTouch: true,
    });
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isScrollContainerMounted]);

  if (isLoading || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <p className="text-[var(--app-fg)]/60">{tCommon("loading")}</p>
      </div>
    );
  }

  const isOnboarding = pathname?.startsWith?.("/onboarding") ?? false;
  const content = isOnboarding ? (
    children
  ) : (
    <RedirectToOnboardingOrRender>{children}</RedirectToOnboardingOrRender>
  );

  const isPlatformAdmin = (user.role ?? "user") === "platform_admin";

  return (
    <WorkspacesProvider token={token}>
      <div className="flex h-screen min-h-screen bg-[var(--app-bg)]">
        {/* Sidebar — desktop */}
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

        {/* Contenedor de scroll: Lenis aplica aquí (wrapper + content) */}
        <div
          ref={scrollWrapperRef}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          <div ref={scrollContentRef} className="min-h-0 min-w-0 flex flex-1 flex-col">
            <SidebarProvider
              value={{
                openMobileNav: () => setMobileNavOpen(true),
                openWorkspacesDrawer: () => setWorkspacesDrawerOpen(true),
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname ?? "default"}
                  className="min-h-0 min-w-0 flex flex-1 flex-col"
                  initial={pageTransition.initial}
                  animate={pageTransition.animate}
                  exit={pageTransition.exit}
                  transition={pageTransition.transition}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </SidebarProvider>
          </div>
        </div>
      </div>
    </WorkspacesProvider>
  );
}
