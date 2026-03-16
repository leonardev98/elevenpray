"use client";

import { useParams } from "next/navigation";
import { DeveloperHeader } from "../../developer/components/DeveloperHeader";
import { useSidebar } from "../../../sidebar-context";
import { UniversityNavbar } from "./components/UniversityNavbar";

export default function UniversityWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebar = useSidebar();
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <>
      <DeveloperHeader
        onOpenMobileNav={() => sidebar?.openMobileNav()}
        showFocusBreak={false}
      />
      <main className="min-h-0 flex-1 bg-[var(--app-bg)] p-4 sm:p-6">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="university-dashboard space-y-4 rounded-2xl p-1">
            <UniversityNavbar workspaceId={workspaceId} />
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
