"use client";

import { DeveloperHeader } from "../workspace/developer/components/DeveloperHeader";
import { useSidebar } from "../sidebar-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useSidebar();

  return (
    <>
      <DeveloperHeader
        onOpenMobileNav={() => sidebar?.openMobileNav()}
        showFocusBreak={false}
      />

      <main className="min-h-0 flex-1 bg-[var(--app-bg)] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </>
  );
}
